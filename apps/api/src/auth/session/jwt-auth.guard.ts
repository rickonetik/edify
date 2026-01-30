import crypto from 'node:crypto';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from './jwt.service.js';
import { UsersRepository } from '../../users/users.repository.js';
import { AuditService } from '../../audit/audit.service.js';
import { ErrorCodes } from '@tracked/shared';

/**
 * JWT Auth Guard
 *
 * Validates JWT token from Authorization header, loads user, enforces ban.
 * Sets req.user on success. On banned user: 403 USER_BANNED + audit.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as {
      headers?: { authorization?: string };
      traceId?: string;
      user?: { userId: string; telegramUserId: string };
    };

    try {
      const authHeader = request.headers?.authorization;

      if (!authHeader || typeof authHeader !== 'string') {
        throw new UnauthorizedException({
          message: 'Missing Authorization header',
          error: 'Unauthorized',
        });
      }

      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new UnauthorizedException({
          message: 'Invalid Authorization header format. Expected: Bearer <token>',
          error: 'Unauthorized',
        });
      }

      const token = parts[1];
      if (!token || token.trim().length === 0) {
        throw new UnauthorizedException({
          message: 'Missing token',
          error: 'Unauthorized',
        });
      }

      const payload = this.jwtService.verifyAccessToken(token);

      const user = await this.usersRepository.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException({
          message: 'User not found',
          error: 'Unauthorized',
        });
      }

      if (user.bannedAt) {
        const traceId = request.traceId ?? crypto.randomUUID();
        await this.auditService.write({
          actorUserId: user.id,
          action: 'request.blocked.banned',
          entityType: 'user',
          entityId: user.id,
          traceId,
          meta: {},
        });
        throw new ForbiddenException({
          message: 'User is banned',
          error: 'Forbidden',
          code: ErrorCodes.USER_BANNED,
        });
      }

      request.user = {
        userId: payload.userId,
        telegramUserId: payload.telegramUserId,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException({
        message: 'Invalid token',
        error: 'Unauthorized',
      });
    }
  }
}
