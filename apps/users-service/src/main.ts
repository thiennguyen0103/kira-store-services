import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { createGrpcOptions } from 'libs/shared/microservices';
import { setupSwagger } from 'libs/shared/swagger';
import { UsersServiceModule } from './users-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule);
  app.connectMicroservice(createGrpcOptions('users', getGrpcUrls().USERS));
  await app.startAllMicroservices();
  setupSwagger(app, { title: 'Users Service' });
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
