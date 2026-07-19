import { NestFactory } from '@nestjs/core';
import { getGrpcUrls } from 'libs/shared/constants';
import { setupLogger } from 'libs/shared/logging';
import { createGrpcOptions } from 'libs/shared/microservices';
import { setupSwagger } from 'libs/shared/swagger';
import { IdentityServiceModule } from './identity-service.module';

async function bootstrap() {
  const app = await NestFactory.create(IdentityServiceModule, {
    bufferLogs: true,
  });
  setupLogger(app);
  app.connectMicroservice(
    createGrpcOptions('identity', getGrpcUrls().IDENTITY),
  );
  await app.startAllMicroservices();
  setupSwagger(app, { title: 'Identity Service' });
  await app.listen(process.env.PORT ?? 3005);
}
void bootstrap();
