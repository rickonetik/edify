import { Module } from '@nestjs/common';
import { MeController } from './me.controller.js';
import { MeExpertApplicationController } from './me-expert-application.controller.js';
import { JwtModule } from '../../auth/session/jwt.module.js';
import { UsersModule } from '../../users/users.module.js';
import { AuditModule } from '../../audit/audit.module.js';
import { ExpertApplicationsModule } from '../../expert-applications/expert-applications.module.js';
import { JwtAuthGuard } from '../../auth/session/jwt-auth.guard.js';

@Module({
  imports: [JwtModule, UsersModule, AuditModule, ExpertApplicationsModule],
  controllers: [MeController, MeExpertApplicationController],
  providers: [JwtAuthGuard],
})
export class MeModule {}
