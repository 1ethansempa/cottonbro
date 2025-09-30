import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { FastifyInstance } from 'fastify';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const fastify = app.getHttpAdapter().getInstance() as FastifyInstance;

  await fastify.register(fastifyCors, {
    origin: [/localhost:\d+$/, /\.vercel\.app$/, /yourdomain\.com$/],
    credentials: true,
  });
  await fastify.register(fastifyHelmet);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Cottonbro API')
    .setDescription('Internal API for web/admin')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, doc);

  await app.listen(
    process.env.PORT ? Number(process.env.PORT) : 3001,
    '0.0.0.0',
  );
}
bootstrap();
