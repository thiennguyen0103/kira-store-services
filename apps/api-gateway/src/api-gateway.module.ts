import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { getGrpcUrls, SERVICE_TOKENS } from 'libs/shared/constants';
import { createGrpcOptions } from 'libs/shared/microservices';
import { OrdersClientPort } from './application/ports/orders-client.port';
import { PaymentsClientPort } from './application/ports/payments-client.port';
import { ProductsClientPort } from './application/ports/products-client.port';
import { UsersClientPort } from './application/ports/users-client.port';
import { OrdersClient } from './infrastructure/client/orders.client';
import { PaymentsClient } from './infrastructure/client/payments.client';
import { ProductsClient } from './infrastructure/client/products.client';
import { UsersClient } from './infrastructure/client/users.client';

const grpcUrls = getGrpcUrls();

@Module({
  imports: [
    ClientsModule.register([
      {
        name: SERVICE_TOKENS.USERS_SERVICE,
        ...createGrpcOptions('users', grpcUrls.USERS),
      },
      {
        name: SERVICE_TOKENS.ORDERS_SERVICE,
        ...createGrpcOptions('orders', grpcUrls.ORDERS),
      },
      {
        name: SERVICE_TOKENS.PAYMENTS_SERVICE,
        ...createGrpcOptions('payments', grpcUrls.PAYMENTS),
      },
      {
        name: SERVICE_TOKENS.PRODUCTS_SERVICE,
        ...createGrpcOptions('products', grpcUrls.PRODUCTS),
      },
    ]),
  ],
  controllers: [],
  providers: [
    { provide: UsersClientPort, useClass: UsersClient },
    { provide: OrdersClientPort, useClass: OrdersClient },
    { provide: PaymentsClientPort, useClass: PaymentsClient },
    { provide: ProductsClientPort, useClass: ProductsClient },
  ],
  exports: [
    UsersClientPort,
    OrdersClientPort,
    PaymentsClientPort,
    ProductsClientPort,
  ],
})
export class ApiGatewayModule {}
