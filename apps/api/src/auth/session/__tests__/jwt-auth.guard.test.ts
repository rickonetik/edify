import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '../jwt-auth.guard.js';
import { JwtService } from '../jwt.service.js';

// Mock env before importing
const originalEnv = process.env;

const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
const mockTelegramUserId = '123456789';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  const TEST_SECRET = 'test-secret-key-for-jwt';

  const mockUsersRepository = {
    findById: async (id: string) =>
      id === mockUserId
        ? {
            id: mockUserId,
            telegramUserId: mockTelegramUserId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            bannedAt: null,
          }
        : null,
  };

  const mockAuditService = { write: async () => {} };

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_ACCESS_SECRET: TEST_SECRET,
      JWT_ACCESS_TTL_SECONDS: '900',
      NODE_ENV: 'test',
    };
    jwtService = new JwtService();
    guard = new JwtAuthGuard(jwtService, mockUsersRepository as any, mockAuditService as any);
  });

  function createMockContext(headers: Record<string, string>): ExecutionContext {
    const request: {
      headers: Record<string, string>;
      user?: { userId: string; telegramUserId: string };
      traceId?: string;
    } = {
      headers,
      user: undefined,
      traceId: 'test-trace-id',
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
      }),
    } as ExecutionContext;
  }

  describe('canActivate', () => {
    it('should allow request with valid Bearer token', async () => {
      const token = jwtService.signAccessToken({
        userId: mockUserId,
        telegramUserId: mockTelegramUserId,
      });

      const context = createMockContext({
        authorization: `Bearer ${token}`,
      });

      const result = await guard.canActivate(context);

      assert.strictEqual(result, true);
      const request = context.switchToHttp().getRequest();
      assert.strictEqual(request.user.userId, mockUserId);
      assert.strictEqual(request.user.telegramUserId, '123456789');
    });

    it('should throw UnauthorizedException for missing Authorization header', () => {
      const context = createMockContext({});

      assert.throws(
        () => guard.canActivate(context),
        (error: UnauthorizedException) => {
          return (
            error instanceof UnauthorizedException &&
            error.message.includes('Missing Authorization header')
          );
        },
      );
    });

    it('should throw UnauthorizedException for invalid Authorization header format', () => {
      const context = createMockContext({
        authorization: 'InvalidFormat token',
      });

      assert.throws(
        () => guard.canActivate(context),
        (error: UnauthorizedException) => {
          return (
            error instanceof UnauthorizedException &&
            error.message.includes('Invalid Authorization header format')
          );
        },
      );
    });

    it('should throw UnauthorizedException for missing token in Bearer format', () => {
      const context = createMockContext({
        authorization: 'Bearer ',
      });

      assert.throws(
        () => guard.canActivate(context),
        (error: UnauthorizedException) => {
          return error instanceof UnauthorizedException && error.message.includes('Missing token');
        },
      );
    });

    it('should throw UnauthorizedException for invalid token', () => {
      const context = createMockContext({
        authorization: 'Bearer invalid.token.here',
      });

      assert.throws(
        () => guard.canActivate(context),
        (error: UnauthorizedException) => {
          return error instanceof UnauthorizedException;
        },
      );
    });

    it('should throw UnauthorizedException for expired token', () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        {
          sub: '123e4567-e89b-12d3-a456-426614174000',
          tg: '123456789',
          iat: Math.floor(Date.now() / 1000) - 1000,
          exp: Math.floor(Date.now() / 1000) - 100,
        },
        TEST_SECRET,
        { algorithm: 'HS256' },
      );

      const context = createMockContext({
        authorization: `Bearer ${expiredToken}`,
      });

      assert.throws(
        () => guard.canActivate(context),
        (error: UnauthorizedException) => {
          return error instanceof UnauthorizedException;
        },
      );
    });

    it('should handle Authorization header as array', () => {
      const token = jwtService.signAccessToken({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        telegramUserId: '123456789',
      });

      const request: {
        headers: { authorization: string[] };
        user?: { userId: string; telegramUserId: string };
      } = {
        headers: {
          authorization: [`Bearer ${token}`],
        },
        user: undefined,
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => ({}),
        }),
      } as ExecutionContext;

      // This should work because we check typeof authHeader === 'string'
      // Arrays will fail the check and throw
      assert.throws(
        () => guard.canActivate(context),
        (error: UnauthorizedException) => {
          return error instanceof UnauthorizedException;
        },
      );
    });
  });
});
