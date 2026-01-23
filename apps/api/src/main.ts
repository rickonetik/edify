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
import { readdirSync } from 'node:fs';

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

    // Find swagger-ui-dist in pnpm structure
    let swaggerUiPath: string | undefined;

    // Try pnpm structure first (most common with pnpm)
    const pnpmPath = join(
      process.cwd(),
      'node_modules/.pnpm/swagger-ui-dist@5.31.0/node_modules/swagger-ui-dist',
    );
    if (existsSync(pnpmPath)) {
      swaggerUiPath = pnpmPath;
    } else {
      // Fallback: try to find any swagger-ui-dist in .pnpm
      const pnpmDir = join(process.cwd(), 'node_modules/.pnpm');
      if (existsSync(pnpmDir)) {
        const dirs = readdirSync(pnpmDir);
        const swaggerDir = dirs.find((d: string) => d.startsWith('swagger-ui-dist@'));
        if (swaggerDir) {
          const foundPath = join(pnpmDir, swaggerDir, 'node_modules/swagger-ui-dist');
          if (existsSync(foundPath)) {
            swaggerUiPath = foundPath;
          }
        }
      }
      // Last fallback: direct node_modules
      if (!swaggerUiPath) {
        swaggerUiPath = join(process.cwd(), 'node_modules/swagger-ui-dist');
      }
    }

    // Register static files if path exists
    if (swaggerUiPath && existsSync(swaggerUiPath)) {
      await fastifyInstance.register(fastifyStatic as any, {
        root: swaggerUiPath,
        prefix: '/docs/',
      });
      logger.info('Swagger UI static files registered successfully');
    } else {
      logger.warn('Swagger UI static files path not found');
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
