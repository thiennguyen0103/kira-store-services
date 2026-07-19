import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { createGrpcOptions } from 'libs/shared/microservices';
import { ProductsServiceModule } from './products-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProductsServiceModule);
  app.connectMicroservice(
    createGrpcOptions('products', getGrpcUrls().PRODUCTS),
  );
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3004);
}
void bootstrap();
