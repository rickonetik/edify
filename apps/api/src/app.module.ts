import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module.js';
import { DatabaseModule } from './database/database.module.js';
import { TelegramAuthModule } from './auth/telegram/telegram-auth.module.js';
import { MeModule } from './modules/me/me.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { ExpertModule } from './modules/expert/expert.module.js';

@Module({
  imports: [DatabaseModule, HealthModule, TelegramAuthModule, MeModule, AdminModule, ExpertModule],
})
export class AppModule {}
