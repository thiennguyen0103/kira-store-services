import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfigOptions, usersServiceEnvSchema } from 'libs/shared/config';
import { UsersGrpcController } from './presentation/users.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('users-service', usersServiceEnvSchema),
    ),
  ],
  controllers: [UsersGrpcController],
  providers: [],
})
export class UsersServiceModule {}
