import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';
import { AppModule } from './app.module.js';
import { requestIdPlugin } from './common/request-id/request-id.plugin.js';
import { createPinoLogger } from './common/logging/pino.js';
async function bootstrap() {
    const env = validateOrThrow(ApiEnvSchema, process.env);
    const logger = createPinoLogger(env.NODE_ENV);
    const adapter = new FastifyAdapter({ logger });
    const app = await NestFactory.create(AppModule, adapter, {
        bufferLogs: false,
    });
    const fastify = app.getHttpAdapter().getInstance();
    // ВАЖНО: register до listen
    await fastify.register(requestIdPlugin);
    await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
