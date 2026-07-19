import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  ordersServiceEnvSchema,
} from 'libs/shared/config';
import { OrdersGrpcController } from './presentation/orders.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('orders-service', ordersServiceEnvSchema),
    ),
    createTypeOrmRootModule(),
  ],
  controllers: [OrdersGrpcController],
  providers: [],
})
export class OrdersServiceModule {}
