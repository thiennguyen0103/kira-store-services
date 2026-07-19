import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  identityServiceEnvSchema,
} from 'libs/shared/config';
import { createLoggerModule } from 'libs/shared/logging';
import { IdentityGrpcController } from './presentation/identity.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('identity-service', identityServiceEnvSchema),
    ),
    createLoggerModule('identity-service'),
    createTypeOrmRootModule(),
  ],
  controllers: [IdentityGrpcController],
  providers: [],
})
export class IdentityServiceModule {}
