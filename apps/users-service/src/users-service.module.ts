import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  usersServiceEnvSchema,
} from 'libs/shared/config';
import { createLoggerModule } from 'libs/shared/logging';
import { UsersGrpcController } from './presentation/users.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('users-service', usersServiceEnvSchema),
    ),
    createLoggerModule('users-service'),
    createTypeOrmRootModule(),
  ],
  controllers: [UsersGrpcController],
  providers: [],
})
export class UsersServiceModule {}
