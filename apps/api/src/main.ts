import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';
import { logger } from './common/logging/pino.js';
import requestIdPlugin from './common/request-id/request-id.plugin.js';
import { AppModule } from './app.module.js';

const env = validateOrThrow(ApiEnvSchema, process.env);

async function bootstrap() {
  const adapter = new FastifyAdapter({
    logger: false,
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

  const fastifyInstance = app.getHttpAdapter().getInstance();

  fastifyInstance.register(requestIdPlugin);

  fastifyInstance.addHook('onResponse', async function (request, reply) {
    const startAt = (request as any)._startAt || Date.now();
    const duration = Date.now() - startAt;
    logger.info({
      traceId: (request as any).traceId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      durationMs: duration,
    });
  });

  await app.listen({ port: env.API_PORT, host: '0.0.0.0' });

  logger.info(`API started on port ${env.API_PORT}`);
}

bootstrap().catch((err) => {
  logger.error(err);
  process.exit(1);
});
