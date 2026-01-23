import { Controller, Get } from '@nestjs/common';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';

const env = validateOrThrow(ApiEnvSchema, process.env);

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      ok: true,
      env: env.NODE_ENV,
      version: process.env.npm_package_version || '0.0.0',
    };
  }
}
