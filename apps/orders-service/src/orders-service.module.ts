import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddCartItemHandler } from 'apps/orders-service/src/application/commands/add-cart-item/add-cart-item.handler';
import { AdminRefundOrderHandler } from 'apps/orders-service/src/application/commands/admin-refund-order/admin-refund-order.handler';
import { CancelOrderHandler } from 'apps/orders-service/src/application/commands/cancel-order/cancel-order.handler';
import { ClearCartHandler } from 'apps/orders-service/src/application/commands/clear-cart/clear-cart.handler';
import { ConfirmOrderHandler } from 'apps/orders-service/src/application/commands/confirm-order/confirm-order.handler';
import { CreateOrderHandler } from 'apps/orders-service/src/application/commands/create-order/create-order.handler';
import { MarkOrderRefundedHandler } from 'apps/orders-service/src/application/commands/mark-order-refunded/mark-order-refunded.handler';
import { RemoveCartItemHandler } from 'apps/orders-service/src/application/commands/remove-cart-item/remove-cart-item.handler';
import { UpdateCartItemHandler } from 'apps/orders-service/src/application/commands/update-cart-item/update-cart-item.handler';
import { OrderCancelledHandler } from 'apps/orders-service/src/application/events/order-cancelled/order-cancelled.handler';
import { OrderConfirmedHandler } from 'apps/orders-service/src/application/events/order-confirmed/order-confirmed.handler';
import { OrderCreatedHandler } from 'apps/orders-service/src/application/events/order-created/order-created.handler';
import { PaymentFailedHandler } from 'apps/orders-service/src/application/external-events/payment-failed.handler';
import { PaymentSucceededHandler } from 'apps/orders-service/src/application/external-events/payment-succeeded.handler';
import { StockReservationFailedHandler } from 'apps/orders-service/src/application/external-events/stock-reservation-failed.handler';
import { StockReservedHandler } from 'apps/orders-service/src/application/external-events/stock-reserved.handler';
import { CartRepositoryPort } from 'apps/orders-service/src/application/ports/cart-repository.port';
import { OrderEventsPublisherPort } from 'apps/orders-service/src/application/ports/order-events-publisher.port';
import { OrderReadModelPort } from 'apps/orders-service/src/application/ports/order-read-model.port';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { PaymentsClientPort } from 'apps/orders-service/src/application/ports/payments-client.port';
import { ProductsClientPort } from 'apps/orders-service/src/application/ports/products-client.port';
import { UsersClientPort } from 'apps/orders-service/src/application/ports/users-client.port';
import { GetCartHandler } from 'apps/orders-service/src/application/queries/get-cart/get-cart.handler';
import { GetOrderHandler } from 'apps/orders-service/src/application/queries/get-order/get-order.handler';
import { ListOrdersHandler } from 'apps/orders-service/src/application/queries/list-orders/list-orders.handler';
import { CheckoutSaga } from 'apps/orders-service/src/application/sagas/checkout.saga';
import { PaymentsClient } from 'apps/orders-service/src/infrastructure/client/payments.client';
import { ProductsClient } from 'apps/orders-service/src/infrastructure/client/products.client';
import { UsersClient } from 'apps/orders-service/src/infrastructure/client/users.client';
import {
  ORDERS_TO_PAYMENTS_CLIENT,
  ORDERS_TO_PRODUCTS_CLIENT,
  RmqEventPublisher,
} from 'apps/orders-service/src/infrastructure/messaging/order-events.publisher';
import { PaymentEventsSubscriber } from 'apps/orders-service/src/infrastructure/messaging/payment-events.subscriber';
import { ProductEventsSubscriber } from 'apps/orders-service/src/infrastructure/messaging/product-events.subscriber';
import { OrderReadRepository } from 'apps/orders-service/src/infrastructure/persistence/read/order-read.repository';
import { CartItemOrmEntity } from 'apps/orders-service/src/infrastructure/persistence/write/cart-item.orm-entity';
import { CartOrmEntity } from 'apps/orders-service/src/infrastructure/persistence/write/cart.orm-entity';
import { CartRepository } from 'apps/orders-service/src/infrastructure/persistence/write/cart.repository';
import { OrderItemOrmEntity } from 'apps/orders-service/src/infrastructure/persistence/write/order-item.orm-entity';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { OrderOrmEntity } from 'apps/orders-service/src/infrastructure/persistence/write/order.orm-entity';
import { OrderRepository } from 'apps/orders-service/src/infrastructure/persistence/write/order.repository';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  ordersServiceEnvSchema,
} from 'libs/shared/config';
import {
  QUEUE_NAMES,
  SERVICE_TOKENS,
  getGrpcUrls,
} from 'libs/shared/constants';
import { createLoggerModule } from 'libs/shared/logging';
import { createGrpcOptions, getRabbitMqUrl } from 'libs/shared/microservices';
import { OrdersController } from './presentation/orders.controller';
import { OrdersGrpcController } from './presentation/orders.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('orders-service', ordersServiceEnvSchema),
    ),
    createLoggerModule('orders-service'),
    createTypeOrmRootModule(),
    TypeOrmModule.forFeature([
      OrderOrmEntity,
      OrderItemOrmEntity,
      CartOrmEntity,
      CartItemOrmEntity,
    ]),
    CqrsModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: ORDERS_TO_PRODUCTS_CLIENT,
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [getRabbitMqUrl()],
            queue: QUEUE_NAMES.PRODUCTS,
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: ORDERS_TO_PAYMENTS_CLIENT,
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [getRabbitMqUrl()],
            queue: QUEUE_NAMES.PAYMENTS,
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: SERVICE_TOKENS.PRODUCTS_SERVICE,
        useFactory: () => createGrpcOptions('products', getGrpcUrls().PRODUCTS),
      },
      {
        name: SERVICE_TOKENS.USERS_SERVICE,
        useFactory: () => createGrpcOptions('users', getGrpcUrls().USERS),
      },
      {
        name: SERVICE_TOKENS.PAYMENTS_SERVICE,
        useFactory: () => createGrpcOptions('payments', getGrpcUrls().PAYMENTS),
      },
    ]),
  ],
  controllers: [
    OrdersGrpcController,
    OrdersController,
    ProductEventsSubscriber,
    PaymentEventsSubscriber,
  ],
  providers: [
    AddCartItemHandler,
    UpdateCartItemHandler,
    RemoveCartItemHandler,
    ClearCartHandler,
    CreateOrderHandler,
    CancelOrderHandler,
    ConfirmOrderHandler,
    AdminRefundOrderHandler,
    MarkOrderRefundedHandler,
    GetCartHandler,
    GetOrderHandler,
    ListOrdersHandler,
    StockReservedHandler,
    StockReservationFailedHandler,
    PaymentSucceededHandler,
    PaymentFailedHandler,
    OrderCreatedHandler,
    OrderCancelledHandler,
    OrderConfirmedHandler,
    CheckoutSaga,
    OrderPersistenceMapper,
    { provide: OrderRepositoryPort, useClass: OrderRepository },
    { provide: CartRepositoryPort, useClass: CartRepository },
    { provide: OrderReadModelPort, useClass: OrderReadRepository },
    { provide: OrderEventsPublisherPort, useClass: RmqEventPublisher },
    { provide: ProductsClientPort, useClass: ProductsClient },
    { provide: UsersClientPort, useClass: UsersClient },
    { provide: PaymentsClientPort, useClass: PaymentsClient },
  ],
})
export class OrdersServiceModule {}
