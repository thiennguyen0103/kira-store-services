import { NestFactory } from '@nestjs/core';
import { getGrpcUrls, QUEUE_NAMES } from 'libs/shared/constants';
import { setupLogger } from 'libs/shared/logging';
import { createGrpcOptions, createRmqOptions } from 'libs/shared/microservices';
import { setupSwagger } from 'libs/shared/swagger';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { UsersServiceModule } from './users-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule, {
    bufferLogs: true,
  });
  setupLogger(app);
  app.useGlobalFilters(new DomainExceptionFilter());
  app.connectMicroservice(createGrpcOptions('users', getGrpcUrls().USERS));
  app.connectMicroservice(createRmqOptions(QUEUE_NAMES.USERS));
  await app.startAllMicroservices();
  setupSwagger(app, { title: 'Users Service' });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
