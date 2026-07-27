import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MarkOrderRefundedCommand } from 'apps/orders-service/src/application/commands/mark-order-refunded/mark-order-refunded.command';
import { HandlePaymentFailedCommand } from 'apps/orders-service/src/application/external-events/handle-payment-failed.command';
import { HandlePaymentSucceededCommand } from 'apps/orders-service/src/application/external-events/handle-payment-succeeded.command';
import { EVENT_NAMES } from 'libs/shared/constants';
import type {
  PaymentFailedEvent,
  PaymentRefundedEvent,
  PaymentSucceededEvent,
} from 'libs/shared/events';

@Controller()
export class PaymentEventsSubscriber {
  private readonly logger = new Logger(PaymentEventsSubscriber.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(EVENT_NAMES.PAYMENT_SUCCEEDED)
  async onPaymentSucceeded(
    @Payload() event: PaymentSucceededEvent,
  ): Promise<void> {
    if (!event?.orderId || !event?.paymentId) {
      this.logger.warn('Ignoring malformed payment.succeeded event');
      return;
    }

    await this.commandBus.execute(
      new HandlePaymentSucceededCommand(
        event.paymentId,
        event.orderId,
        event.provider,
        event.providerPaymentId,
        event.amountMinor,
        event.currency,
      ),
    );
  }

  @EventPattern(EVENT_NAMES.PAYMENT_FAILED)
  async onPaymentFailed(@Payload() event: PaymentFailedEvent): Promise<void> {
    if (!event?.orderId || !event?.paymentId) {
      this.logger.warn('Ignoring malformed payment.failed event');
      return;
    }

    await this.commandBus.execute(
      new HandlePaymentFailedCommand(
        event.paymentId,
        event.orderId,
        event.provider,
        event.reason,
      ),
    );
  }

  @EventPattern(EVENT_NAMES.PAYMENT_REFUNDED)
  async onPaymentRefunded(
    @Payload() event: PaymentRefundedEvent,
  ): Promise<void> {
    if (!event?.orderId || !event?.paymentId) {
      this.logger.warn('Ignoring malformed payment.refunded event');
      return;
    }

    await this.commandBus.execute(
      new MarkOrderRefundedCommand(event.orderId, event.paymentId),
    );
  }
}
