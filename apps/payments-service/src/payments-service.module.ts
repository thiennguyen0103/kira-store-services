import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePaymentIntentHandler } from 'apps/payments-service/src/application/commands/create-payment-intent/create-payment-intent.handler';
import { ProcessWebhookHandler } from 'apps/payments-service/src/application/commands/process-webhook/process-webhook.handler';
import { RefundPaymentHandler } from 'apps/payments-service/src/application/commands/refund-payment/refund-payment.handler';
import { PaymentGatewayPort } from 'apps/payments-service/src/application/ports/payment-gateway.port';
import { GetPaymentByOrderIdHandler } from 'apps/payments-service/src/application/queries/get-payment-by-order-id/get-payment-by-order-id.handler';
import { GetPaymentHandler } from 'apps/payments-service/src/application/queries/get-payment/get-payment.handler';
import { PaymentQueryRepository } from 'apps/payments-service/src/application/queries/repositories/payment-query.repository';
import { PaymentRepository } from 'apps/payments-service/src/domain/repositories/payment.repository';
import { OrderEventsSubscriber } from 'apps/payments-service/src/infrastructure/messaging/order-events.subscriber';
import {
  PAYMENTS_EVENT_CLIENT,
  RmqEventPublisher,
} from 'apps/payments-service/src/infrastructure/messaging/payment-events.publisher';
import { DevMockPaymentGateway } from 'apps/payments-service/src/infrastructure/payment-gateways/dev-mock.payment-gateway';
import { PayOsClient } from 'apps/payments-service/src/infrastructure/payment-gateways/payos.client';
import { PayOsPaymentGateway } from 'apps/payments-service/src/infrastructure/payment-gateways/payos.payment-gateway';
import { RoutingPaymentGateway } from 'apps/payments-service/src/infrastructure/payment-gateways/routing.payment-gateway';
import { StripeClient } from 'apps/payments-service/src/infrastructure/payment-gateways/stripe.client';
import { StripePaymentGateway } from 'apps/payments-service/src/infrastructure/payment-gateways/stripe.payment-gateway';
import { PaymentOrmEntity } from 'apps/payments-service/src/infrastructure/persistence/entities/payment.orm-entity';
import { PaymentPersistenceMapper } from 'apps/payments-service/src/infrastructure/persistence/mappers/payment-persistence.mapper';
import { TypeOrmPaymentQueryRepository } from 'apps/payments-service/src/infrastructure/persistence/repositories/typeorm-payment-query.repository';
import { TypeOrmPaymentRepository } from 'apps/payments-service/src/infrastructure/persistence/repositories/typeorm-payment.repository';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  paymentsServiceEnvSchema,
} from 'libs/shared/config';
import { QUEUE_NAMES } from 'libs/shared/constants';
import { EventPublisher } from 'libs/shared/interfaces';
import { createLoggerModule } from 'libs/shared/logging';
import { getRabbitMqUrl } from 'libs/shared/microservices';
import { PaymentsGrpcController } from './presentation/payments.grpc.controller';
import { WebhooksHttpController } from './presentation/webhooks.http.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('payments-service', paymentsServiceEnvSchema),
    ),
    createLoggerModule('payments-service'),
    createTypeOrmRootModule(),
    TypeOrmModule.forFeature([PaymentOrmEntity]),
    CqrsModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: PAYMENTS_EVENT_CLIENT,
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [getRabbitMqUrl()],
            queue: QUEUE_NAMES.ORDERS,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [
    PaymentsGrpcController,
    WebhooksHttpController,
    OrderEventsSubscriber,
  ],
  providers: [
    CreatePaymentIntentHandler,
    RefundPaymentHandler,
    ProcessWebhookHandler,
    GetPaymentHandler,
    GetPaymentByOrderIdHandler,
    PaymentPersistenceMapper,
    StripeClient,
    PayOsClient,
    StripePaymentGateway,
    PayOsPaymentGateway,
    DevMockPaymentGateway,
    { provide: PaymentGatewayPort, useClass: RoutingPaymentGateway },
    { provide: PaymentRepository, useClass: TypeOrmPaymentRepository },
    {
      provide: PaymentQueryRepository,
      useClass: TypeOrmPaymentQueryRepository,
    },
    { provide: EventPublisher, useClass: RmqEventPublisher },
  ],
})
export class PaymentsServiceModule {}
