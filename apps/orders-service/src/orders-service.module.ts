import { Module } from '@nestjs/common';
import { OrdersGrpcController } from './presentation/orders.grpc.controller';

@Module({
  imports: [],
  controllers: [OrdersGrpcController],
  providers: [],
})
export class OrdersServiceModule {}
