import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { json, raw, static as serveStatic, urlencoded } from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { cwd } from 'process';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './lib/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(cookieParser());

  const allowedOrigins = config
    .get<string>('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'access_token',
      'Idempotency-Key',
    ],
  });

  app.use('/uploads', serveStatic(join(cwd(), 'uploads')));
  app.use('/billing/stripe/webhook', raw({ type: 'application/json' }));
  app.use(json({ limit: config.get<string>('JSON_BODY_LIMIT', '20mb') }));
  app.use(
    urlencoded({
      extended: true,
      limit: config.get<string>('URLENCODED_BODY_LIMIT', '20mb'),
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AgriVision AI API')
    .setDescription(
      'Agriculture, marketplace, AI, weather and administration API',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  const port = config.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
