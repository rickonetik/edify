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

  const adapter = new FastifyAdapter({ logger });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: false,
  });

  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  // Swagger только в dev
  if (env.NODE_ENV !== 'production') {
    // Register static files for Swagger UI (required for Fastify)
    // swagger-ui-dist is in root node_modules (pnpm hoisting)
    const swaggerUiPath = join(process.cwd(), 'node_modules/swagger-ui-dist');
    const fastifyInstance = app.getHttpAdapter().getInstance();
    await fastifyInstance.register(fastifyStatic, {
      root: swaggerUiPath,
      prefix: '/docs/',
    });

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
