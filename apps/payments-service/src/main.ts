import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { createGrpcOptions } from 'libs/shared/microservices';
import { setupSwagger } from 'libs/shared/swagger';
import { PaymentsServiceModule } from './payments-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsServiceModule);
  app.connectMicroservice(
    createGrpcOptions('payments', getGrpcUrls().PAYMENTS),
  );
  await app.startAllMicroservices();
  setupSwagger(app, { title: 'Payments Service' });
  await app.listen(process.env.port ?? 3003);
}
void bootstrap();
