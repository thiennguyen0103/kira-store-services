import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { RefundPaymentCommand } from 'apps/payments-service/src/application/commands/refund-payment/refund-payment.command';
import { PaymentRepository } from 'apps/payments-service/src/domain/repositories/payment.repository';
import { EVENT_NAMES } from 'libs/shared/constants';
import { PaymentStatus } from 'libs/shared/enums';
import type {
  OrderCancelledEvent,
  PaymentFailedEvent,
} from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';

@Controller()
export class OrderEventsSubscriber {
  private readonly logger = new Logger(OrderEventsSubscriber.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly payments: PaymentRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  @EventPattern(EVENT_NAMES.ORDER_CANCELLED)
  async onOrderCancelled(@Payload() event: OrderCancelledEvent): Promise<void> {
    if (!event?.orderId) {
      this.logger.warn('Ignoring malformed order.cancelled event');
      return;
    }

    const payment = await this.payments.findByOrderId(event.orderId);
    if (!payment) {
      this.logger.debug(`No payment for cancelled order ${event.orderId}`);
      return;
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      await this.commandBus.execute(
        new RefundPaymentCommand(
          payment.id.value,
          event.orderId,
          'order.cancelled',
        ),
      );
      this.logger.log(`Refunded payment for cancelled order ${event.orderId}`);
      return;
    }

    if (payment.status === PaymentStatus.INITIATED) {
      payment.markFailed('order.cancelled');
      await this.payments.save(payment);

      const payload: PaymentFailedEvent = {
        paymentId: payment.id.value,
        orderId: payment.orderId,
        provider: payment.provider,
        reason: 'order.cancelled',
        occurredAt: new Date().toISOString(),
      };
      await this.eventPublisher.publish(EVENT_NAMES.PAYMENT_FAILED, payload);

      this.logger.log(
        `Marked payment failed for cancelled order ${event.orderId}`,
      );
    }
  }
}
