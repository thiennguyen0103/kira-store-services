import { NestFactory } from '@nestjs/core';
import { setupSwagger } from 'libs/shared/swagger';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  setupSwagger(app, {
    title: 'Kira Store API',
    description: 'The Kira Store API description',
  });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
