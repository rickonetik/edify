import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';
import { AppModule } from './app.module.js';
import { createPinoLogger } from './common/logging/pino.js';
import { RequestIdInterceptor } from './common/request-id/request-id.interceptor.js';
async function bootstrap() {
    const env = validateOrThrow(ApiEnvSchema, process.env);
    const logger = createPinoLogger(env.NODE_ENV);
    const adapter = new FastifyAdapter({ logger });
    const app = await NestFactory.create(AppModule, adapter, {
        bufferLogs: false,
    });
    app.useGlobalInterceptors(new RequestIdInterceptor());
    await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
