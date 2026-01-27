import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from './jwt.service.js';

/**
 * JWT Auth Guard
 *
 * Validates JWT token from Authorization header and sets req.user
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request: any = context.switchToHttp().getRequest();
      const authHeader = request.headers?.authorization;

      if (!authHeader || typeof authHeader !== 'string') {
        throw new UnauthorizedException({
          message: 'Missing Authorization header',
          error: 'Unauthorized',
        });
      }

      // Extract token from "Bearer <token>"
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

      // Verify token (throws UnauthorizedException on error)
      const payload = this.jwtService.verifyAccessToken(token);

      // Set user on request
      request.user = {
        userId: payload.userId,
        telegramUserId: payload.telegramUserId,
      };

      return true;
    } catch (error) {
      // Ensure all errors are converted to UnauthorizedException (never leak raw errors)
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      // Catch any unexpected errors and convert to UnauthorizedException
      throw new UnauthorizedException({
        message: 'Invalid token',
        error: 'Unauthorized',
      });
    }
  }
}
