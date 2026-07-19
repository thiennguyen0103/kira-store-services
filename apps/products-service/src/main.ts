import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { createGrpcOptions } from 'libs/shared/microservices';
import { setupSwagger } from 'libs/shared/swagger';
import { ProductsServiceModule } from './products-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsServiceModule);
  app.connectMicroservice(
    createGrpcOptions('products', getGrpcUrls().PRODUCTS),
  );
  await app.startAllMicroservices();
  setupSwagger(app, { title: 'Products Service' });
  await app.listen(process.env.port ?? 3004);
}
void bootstrap();
