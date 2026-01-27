import { Controller, Get, UseGuards, UnauthorizedException, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContractsV1 } from '@tracked/shared';
import { JwtAuthGuard } from '../../auth/session/jwt-auth.guard.js';
import { UsersRepository } from '../../users/users.repository.js';

@ApiTags('User')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeController {
  constructor(private readonly usersRepository: UsersRepository) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({
    status: 200,
    description: 'Current user data',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          description: 'User data',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  async getMe(
    @Request()
    request: {
      user?: { userId: string; telegramUserId: string };
    },
  ): Promise<ContractsV1.GetMeResponseV1> {
    const userId = request.user?.userId;

    if (!userId) {
      throw new UnauthorizedException({
        message: 'User not found in request',
        error: 'Unauthorized',
      });
    }

    // Find user by ID
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException({
        message: 'User not found',
        error: 'Unauthorized',
      });
    }

    return { user };
  }
}
