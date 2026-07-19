import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { createGrpcOptions } from 'libs/shared/microservices';
import { UsersServiceModule } from './users-service.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersServiceModule);
  app.connectMicroservice(createGrpcOptions('users', getGrpcUrls().USERS));
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);
}
void bootstrap();
