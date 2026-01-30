import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { UsersModule } from '../../users/users.module.js';
import { AuditModule } from '../../audit/audit.module.js';

@Module({
  imports: [UsersModule, AuditModule],
  providers: [JwtService, JwtAuthGuard],
  exports: [JwtService, JwtAuthGuard],
})
export class JwtModule {}
