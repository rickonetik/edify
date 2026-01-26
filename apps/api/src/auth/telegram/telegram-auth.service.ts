import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ContractsV1 } from '@tracked/shared';
import { validateTelegramInitData, TelegramInitDataValidationError } from './telegram-init-data.js';
import { UsersRepository } from '../../users/users.repository.js';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';

const env = validateOrThrow(ApiEnvSchema, process.env);

@Injectable()
export class TelegramAuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Verify Telegram initData and upsert user
   *
   * @param initData - Raw initData string from Telegram WebApp
   * @returns User data
   * @throws {BadRequestException} On malformed initData or missing fields
   * @throws {UnauthorizedException} On invalid signature or expired auth_date
   */
  async verifyAndUpsert(initData: string): Promise<ContractsV1.UserV1> {
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

      return user;
    } catch (error) {
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
