import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { createGrpcOptions } from 'libs/shared/microservices';
import { PaymentsServiceModule } from './payments-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsServiceModule);
  app.connectMicroservice(
    createGrpcOptions('payments', getGrpcUrls().PAYMENTS),
  );
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3003);
}
void bootstrap();
