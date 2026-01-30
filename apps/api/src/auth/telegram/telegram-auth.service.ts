import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ContractsV1 } from '@tracked/shared';
import { validateTelegramInitData, TelegramInitDataValidationError } from './telegram-init-data.js';
import { UsersRepository } from '../../users/users.repository.js';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';
import { JwtService } from '../session/jwt.service.js';

const env = validateOrThrow(ApiEnvSchema, process.env);

@Injectable()
export class TelegramAuthService {
  private readonly logger = new Logger(TelegramAuthService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verify Telegram initData and upsert user
   *
   * @param initData - Raw initData string from Telegram WebApp
   * @returns User data and access token
   * @throws {BadRequestException} On malformed initData or missing fields
   * @throws {UnauthorizedException} On invalid signature or expired auth_date
   */
  async verifyAndUpsert(initData: string): Promise<ContractsV1.AuthTelegramResponseV1> {
    try {
      // Validate initData
      const validated = validateTelegramInitData(
        initData,
        env.TELEGRAM_BOT_TOKEN,
        env.TELEGRAM_INITDATA_MAX_AGE_SECONDS,
      );
      this.logger.log(
        `initData validated: telegramUserId=${validated.telegramUserId}, firstName=${validated.firstName ?? '—'}, username=${validated.username ?? '—'}`,
      );

      // Upsert user
      const user = await this.usersRepository.upsertByTelegramUserId({
        telegramUserId: validated.telegramUserId,
        username: validated.username,
        firstName: validated.firstName,
        lastName: validated.lastName,
        avatarUrl: validated.avatarUrl,
      });

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
      if (error instanceof TelegramInitDataValidationError) {
        this.logger.warn(
          `initData validation failed: code=${error.code}, message=${error.message}`,
        );
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
      this.logger.error(
        `verifyAndUpsert unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Re-throw unexpected errors
      throw error;
    }
  }
}
