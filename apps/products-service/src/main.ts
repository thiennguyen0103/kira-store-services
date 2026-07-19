import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { setupLogger } from 'libs/shared/logging';
import { createGrpcOptions } from 'libs/shared/microservices';
import { setupSwagger } from 'libs/shared/swagger';
import { ProductsServiceModule } from './products-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsServiceModule, {
    bufferLogs: true,
  });
  setupLogger(app);
  app.connectMicroservice(
    createGrpcOptions('products', getGrpcUrls().PRODUCTS),
  );
  await app.startAllMicroservices();
  setupSwagger(app, { title: 'Products Service' });
  await app.listen(process.env.PORT ?? 3004);
}
void bootstrap();
