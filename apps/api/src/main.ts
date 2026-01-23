import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';
import { AppModule } from './app.module.js';
import { createPinoLogger } from './common/logging/pino.js';
import { RequestIdInterceptor } from './common/request-id/request-id.interceptor.js';
import { ApiExceptionFilter } from './common/errors/api-exception.filter.js';

async function bootstrap() {
  const env = validateOrThrow(ApiEnvSchema, process.env);

  const logger = createPinoLogger(env.NODE_ENV);

  // Enable ignoreTrailingSlash to handle both /docs and /docs/ routes
  const adapter = new FastifyAdapter({ logger, ignoreTrailingSlash: true });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: false,
  });

  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  // Swagger только в dev
  if (env.NODE_ENV !== 'production') {
    // Register static files for Swagger UI (required for Fastify)
    const fastifyInstance = app.getHttpAdapter().getInstance();
    const require = createRequire(import.meta.url);

    try {
      // Resolve swagger-ui-dist package
      const swaggerUiDistPath = require.resolve('swagger-ui-dist');
      const swaggerUiPath = join(swaggerUiDistPath, '..');

      await fastifyInstance.register(fastifyStatic as any, {
        root: swaggerUiPath,
        prefix: '/docs/',
      });
    } catch (err) {
      logger.warn('Failed to register Swagger UI static files:', err);
    }

    const config = new DocumentBuilder()
      .setTitle('tracked-lms API')
      .setDescription('Telegram Mini App backend')
      .setVersion(process.env.npm_package_version || '0.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/docs', app, document);
  }

  await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
