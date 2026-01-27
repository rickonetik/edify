import { Module } from '@nestjs/common';
import { MeController } from './me.controller.js';
import { JwtModule } from '../../auth/session/jwt.module.js';
import { UsersModule } from '../../users/users.module.js';

@Module({
  imports: [JwtModule, UsersModule],
  controllers: [MeController],
})
export class MeModule {}
