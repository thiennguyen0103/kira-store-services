import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getGrpcUrls, QUEUE_NAMES } from 'libs/shared/constants';
import { setupLogger } from 'libs/shared/logging';
import { createGrpcOptions, createRmqOptions } from 'libs/shared/microservices';
import { setupSwagger } from 'libs/shared/swagger';
import { PaymentsServiceModule } from './payments-service.module';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(PaymentsServiceModule, {
    bufferLogs: true,
    rawBody: true,
  });
  setupLogger(app);
  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.connectMicroservice(
    createGrpcOptions('payments', getGrpcUrls().PAYMENTS),
  );
  app.connectMicroservice(createRmqOptions(QUEUE_NAMES.PAYMENTS));
  await app.startAllMicroservices();
  setupSwagger(app, { title: 'Payments Service' });
  await app.listen(process.env.PORT ?? 3003);
}
void bootstrap();
