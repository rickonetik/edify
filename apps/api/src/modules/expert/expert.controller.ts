import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/session/jwt-auth.guard.js';
import { ExpertRoleGuard } from '../../auth/expert-rbac/expert-role.guard.js';
import { RequireExpertRole } from '../../auth/expert-rbac/require-expert-role.decorator.js';
import { ExpertId } from '../../auth/expert-rbac/expert-context.decorator.js';

@ApiTags('Expert')
@Controller('experts')
@UseGuards(JwtAuthGuard, ExpertRoleGuard)
@ApiBearerAuth()
export class ExpertController {
  @Get(':expertId/ping')
  @RequireExpertRole('support')
  @ApiOperation({ summary: 'Expert ping (any member with support+ role)' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'EXPERT_CONTEXT_REQUIRED' })
  @ApiResponse({ status: 403, description: 'EXPERT_MEMBERSHIP_REQUIRED or FORBIDDEN_EXPERT_ROLE' })
  ping(@ExpertId() expertId: string): { ok: true; expertId: string } {
    return { ok: true, expertId };
  }

  @Get(':expertId/admin-ping')
  @RequireExpertRole('manager')
  @ApiOperation({ summary: 'Expert admin ping (manager or owner only)' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 400, description: 'EXPERT_CONTEXT_REQUIRED' })
  @ApiResponse({ status: 403, description: 'EXPERT_MEMBERSHIP_REQUIRED or FORBIDDEN_EXPERT_ROLE' })
  adminPing(@Param('expertId') _expertId: string): { ok: true } {
    return { ok: true };
  }
}
