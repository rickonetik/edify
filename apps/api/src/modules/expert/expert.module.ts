import { Module } from '@nestjs/common';
import { JwtModule } from '../../auth/session/jwt.module.js';
import { ExpertRbacModule } from '../../auth/expert-rbac/expert-rbac.module.js';
import { UsersModule } from '../../users/users.module.js';
import { ExpertsModule } from '../../experts/experts.module.js';
import { AuditModule } from '../../audit/audit.module.js';
import { JwtAuthGuard } from '../../auth/session/jwt-auth.guard.js';
import { ExpertController } from './expert.controller.js';

@Module({
  imports: [JwtModule, ExpertRbacModule, UsersModule, ExpertsModule, AuditModule],
  controllers: [ExpertController],
  providers: [JwtAuthGuard],
})
export class ExpertModule {}
