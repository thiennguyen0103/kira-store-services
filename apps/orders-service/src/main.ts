import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { createGrpcOptions } from 'libs/shared/microservices';
import { OrdersServiceModule } from './orders-service.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersServiceModule);
  app.connectMicroservice(createGrpcOptions('orders', getGrpcUrls().ORDERS));
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3002);
}
void bootstrap();
