import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { apiGatewayEnvSchema, appConfigOptions } from 'libs/shared/config';
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

@Module({
  imports: [
    ConfigModule.forRoot(appConfigOptions('api-gateway', apiGatewayEnvSchema)),
    ClientsModule.registerAsync([
      {
        name: SERVICE_TOKENS.USERS_SERVICE,
        useFactory: () => createGrpcOptions('users', getGrpcUrls().USERS),
      },
      {
        name: SERVICE_TOKENS.ORDERS_SERVICE,
        useFactory: () => createGrpcOptions('orders', getGrpcUrls().ORDERS),
      },
      {
        name: SERVICE_TOKENS.PAYMENTS_SERVICE,
        useFactory: () => createGrpcOptions('payments', getGrpcUrls().PAYMENTS),
      },
      {
        name: SERVICE_TOKENS.PRODUCTS_SERVICE,
        useFactory: () => createGrpcOptions('products', getGrpcUrls().PRODUCTS),
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
