import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiEnvSchema, validateOrThrow } from '@tracked/shared';
import { AppModule } from './app.module.js';
import { createPinoLogger } from './common/logging/pino.js';
import { RequestIdInterceptor } from './common/request-id/request-id.interceptor.js';
import { ApiExceptionFilter } from './common/errors/api-exception.filter.js';
import fastifyStatic from '@fastify/static';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

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
    const config = new DocumentBuilder()
      .setTitle('tracked-lms API')
      .setDescription('Telegram Mini App backend')
      .setVersion(process.env.npm_package_version || '0.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Register static files for Swagger UI (required for Fastify)
    // Use createRequire to resolve swagger-ui-dist from any location
    const fastifyInstance = app.getHttpAdapter().getInstance();
    const require = createRequire(import.meta.url);
    let swaggerUiPath: string;

    try {
      // Try to resolve swagger-ui-dist using require.resolve
      const resolvedPath = require.resolve('swagger-ui-dist/package.json');
      swaggerUiPath = dirname(resolvedPath);
    } catch {
      // Fallback: try pnpm structure
      const pnpmPath = join(
        process.cwd(),
        'node_modules/.pnpm/swagger-ui-dist@5.31.0/node_modules/swagger-ui-dist',
      );
      if (existsSync(pnpmPath)) {
        swaggerUiPath = pnpmPath;
      } else {
        // Last fallback: direct node_modules
        swaggerUiPath = join(process.cwd(), 'node_modules/swagger-ui-dist');
      }
    }

    await fastifyInstance.register(fastifyStatic as any, {
      root: swaggerUiPath,
      prefix: '/docs/',
    });

    SwaggerModule.setup('/docs', app, document);
  }

  await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
