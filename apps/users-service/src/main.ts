import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { setupLogger } from 'libs/shared/logging';
import { createGrpcOptions } from 'libs/shared/microservices';
import { setupSwagger } from 'libs/shared/swagger';
import { UsersServiceModule } from './users-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule, {
    bufferLogs: true,
  });
  setupLogger(app);
  app.connectMicroservice(createGrpcOptions('users', getGrpcUrls().USERS));
  await app.startAllMicroservices();
  setupSwagger(app, { title: 'Users Service' });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
