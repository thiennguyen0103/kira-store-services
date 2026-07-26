import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule } from '@nestjs/microservices';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { apiGatewayEnvSchema, appConfigOptions } from 'libs/shared/config';
import { getGrpcUrls, SERVICE_TOKENS } from 'libs/shared/constants';
import { createLoggerModule } from 'libs/shared/logging';
import { createGrpcOptions } from 'libs/shared/microservices';
import { IdentityClientPort } from './application/ports/identity-client.port';
import { OrdersClientPort } from './application/ports/orders-client.port';
import { PaymentsClientPort } from './application/ports/payments-client.port';
import { ProductsClientPort } from './application/ports/products-client.port';
import { UsersClientPort } from './application/ports/users-client.port';
import { IdentityClient } from './infrastructure/client/identity.client';
import { OrdersClient } from './infrastructure/client/orders.client';
import { PaymentsClient } from './infrastructure/client/payments.client';
import { ProductsClient } from './infrastructure/client/products.client';
import { UsersClient } from './infrastructure/client/users.client';
import { AuthController } from './presentation/auth.controller';
import { BrandsController } from './presentation/brands.controller';
import { CategoriesController } from './presentation/categories.controller';
import { ProductsController } from './presentation/products.controller';
import { UsersController } from './presentation/users.controller';

@Module({
  imports: [
    ConfigModule.forRoot(appConfigOptions('api-gateway', apiGatewayEnvSchema)),
    createLoggerModule('api-gateway'),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
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
      {
        name: SERVICE_TOKENS.IDENTITY_SERVICE,
        useFactory: () => createGrpcOptions('identity', getGrpcUrls().IDENTITY),
      },
    ]),
  ],
  controllers: [
    UsersController,
    AuthController,
    ProductsController,
    BrandsController,
    CategoriesController,
  ],
  providers: [
    { provide: UsersClientPort, useClass: UsersClient },
    { provide: OrdersClientPort, useClass: OrdersClient },
    { provide: PaymentsClientPort, useClass: PaymentsClient },
    { provide: ProductsClientPort, useClass: ProductsClient },
    { provide: IdentityClientPort, useClass: IdentityClient },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [
    UsersClientPort,
    OrdersClientPort,
    PaymentsClientPort,
    ProductsClientPort,
    IdentityClientPort,
  ],
})
export class ApiGatewayModule {}
