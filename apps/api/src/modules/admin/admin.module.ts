import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminExpertsController } from './admin.experts.controller.js';
import { AdminAuditController } from './admin-audit.controller.js';
import { UsersModule } from '../../users/users.module.js';
import { ExpertsModule } from '../../experts/experts.module.js';
import { JwtModule } from '../../auth/session/jwt.module.js';
import { AuditModule } from '../../audit/audit.module.js';
import { JwtAuthGuard } from '../../auth/session/jwt-auth.guard.js';
import { PlatformRoleGuard } from '../../auth/rbac/platform-role.guard.js';

@Module({
  imports: [JwtModule, UsersModule, ExpertsModule, AuditModule],
  controllers: [AdminController, AdminExpertsController, AdminAuditController],
  providers: [JwtAuthGuard, PlatformRoleGuard],
})
export class AdminModule {}
