import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ContractsV1, ErrorCodes } from '@tracked/shared';
import { validateTelegramInitData, TelegramInitDataValidationError } from './telegram-init-data.js';
import { UsersRepository } from '../../users/users.repository.js';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';
import { JwtService } from '../session/jwt.service.js';
import { AuditService } from '../../audit/audit.service.js';

const env = validateOrThrow(ApiEnvSchema, process.env);

@Injectable()
export class TelegramAuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Verify Telegram initData and upsert user
   *
   * @param initData - Raw initData string from Telegram WebApp
   * @param traceId - Request trace id (x-request-id) for audit
   * @returns User data and access token
   * @throws {BadRequestException} On malformed initData or missing fields
   * @throws {UnauthorizedException} On invalid signature or expired auth_date
   * @throws {ForbiddenException} When user is banned (USER_BANNED)
   */
  async verifyAndUpsert(
    initData: string,
    traceId: string,
  ): Promise<ContractsV1.AuthTelegramResponseV1> {
    try {
      // Validate initData
      const validated = validateTelegramInitData(
        initData,
        env.TELEGRAM_BOT_TOKEN,
        env.TELEGRAM_INITDATA_MAX_AGE_SECONDS,
      );

      // Upsert user
      const user = await this.usersRepository.upsertByTelegramUserId({
        telegramUserId: validated.telegramUserId,
        username: validated.username,
        firstName: validated.firstName,
        lastName: validated.lastName,
        avatarUrl: validated.avatarUrl,
      });

      // Ban enforcement: do not issue token
      if (user.bannedAt) {
        await this.auditService.write({
          actorUserId: user.id,
          action: 'auth.blocked.banned',
          entityType: 'user',
          entityId: user.id,
          traceId,
          meta: {},
        });
        throw new ForbiddenException({
          message: 'User is banned',
          error: 'Forbidden',
          code: ErrorCodes.USER_BANNED,
        });
      }

      // Generate access token
      // telegramUserId is always present after upsertByTelegramUserId
      if (!user.telegramUserId) {
        throw new Error('telegramUserId is missing after user upsert');
      }
      const accessToken = this.jwtService.signAccessToken({
        userId: user.id,
        telegramUserId: user.telegramUserId,
      });

      return { user, accessToken };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof TelegramInitDataValidationError) {
        if (error.code === 'MALFORMED') {
          throw new BadRequestException({
            message: error.message,
            error: 'Bad Request',
          });
        }
        // INVALID_SIGNATURE or EXPIRED
        throw new UnauthorizedException({
          message: error.message,
          error: 'Unauthorized',
        });
      }
      // Re-throw unexpected errors
      throw error;
    }
  }
}
