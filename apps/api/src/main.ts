import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { FastifyInstance } from 'fastify';

async function bootstrap() {
  const isDev = process.env.NODE_ENV !== 'production';

  const adapter = new FastifyAdapter({
    logger: isDev
      ? {
          level: 'info',
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              singleLine: false,
            },
          },
        }
      : { level: 'info' },
  });

  const app = await NestFactory.create(AppModule, adapter);

  const fastify = app.getHttpAdapter().getInstance() as FastifyInstance;

  await fastify.register(fastifyCors, {
    origin: true,
    credentials: true,
  });
  await fastify.register(fastifyHelmet);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Cottonbro API')
    .setDescription('Internal API for web/admin')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, doc);

  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);

  if (isDev) {
    const url = await app.getUrl();
    console.log(`🚀 API running at ${url} (Swagger at ${url}/docs)`);
  }
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap app', err);
  process.exit(1);
});
