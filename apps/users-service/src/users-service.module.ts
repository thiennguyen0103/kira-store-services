import { Module } from '@nestjs/common';
import { UsersGrpcController } from './presentation/users.grpc.controller';

@Module({
  imports: [],
  controllers: [UsersGrpcController],
  providers: [],
})
export class UsersServiceModule {}
