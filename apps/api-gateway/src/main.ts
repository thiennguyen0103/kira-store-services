import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { setupLogger } from 'libs/shared/logging';
import { setupSwagger } from 'libs/shared/swagger';
import { ApiGatewayModule } from './api-gateway.module';

/** `*` (or empty) → allow any origin; otherwise a comma-separated allowlist. */
function parseCorsOrigin(raw: string | undefined): boolean | string[] {
  const value = (raw ?? '*').trim();
  if (!value || value === '*') {
    return true;
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bufferLogs: true });
  setupLogger(app);

  const config = app.get(ConfigService);
  app.enableCors({
    origin: parseCorsOrigin(config.get<string>('CORS_ORIGINS')),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  setupSwagger(app, {
    title: 'Kira Store API',
    description: 'The Kira Store API description',
  });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
