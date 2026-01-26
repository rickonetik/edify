import { Module } from '@nestjs/common';
import { TelegramAuthController } from './telegram-auth.controller.js';
import { TelegramAuthService } from './telegram-auth.service.js';
import { UsersModule } from '../../users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [TelegramAuthController],
  providers: [TelegramAuthService],
})
export class TelegramAuthModule {}
