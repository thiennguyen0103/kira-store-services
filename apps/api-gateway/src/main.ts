import { NestFactory } from '@nestjs/core';
import { setupLogger } from 'libs/shared/logging';
import { setupSwagger } from 'libs/shared/swagger';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bufferLogs: true });
  setupLogger(app);
  setupSwagger(app, {
    title: 'Kira Store API',
    description: 'The Kira Store API description',
  });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
