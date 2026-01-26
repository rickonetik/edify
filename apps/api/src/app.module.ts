import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module.js';
import { DatabaseModule } from './database/database.module.js';
import { TelegramAuthModule } from './auth/telegram/telegram-auth.module.js';

@Module({
  imports: [DatabaseModule, HealthModule, TelegramAuthModule],
})
export class AppModule {}
