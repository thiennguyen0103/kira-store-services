import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentGatewayPort } from 'apps/payments-service/src/application/ports/payment-gateway.port';
import { PaymentNotFoundException } from 'apps/payments-service/src/domain/exceptions/payment-not-found.exception';
import { PaymentRepository } from 'apps/payments-service/src/domain/repositories/payment.repository';
import { PaymentId } from 'apps/payments-service/src/domain/value-objects/payment-id.vo';
import { EVENT_NAMES } from 'libs/shared/constants';
import { PaymentStatus } from 'libs/shared/enums';
import type {
  PaymentFailedEvent,
  PaymentRefundedEvent,
  PaymentSucceededEvent,
} from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import { ProcessWebhookCommand } from './process-webhook.command';

@CommandHandler(ProcessWebhookCommand)
export class ProcessWebhookHandler implements ICommandHandler<ProcessWebhookCommand> {
  private readonly logger = new Logger(ProcessWebhookHandler.name);

  constructor(
    private readonly payments: PaymentRepository,
    private readonly gateway: PaymentGatewayPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ProcessWebhookCommand): Promise<void> {
    const event = await this.gateway.verifyWebhook(
      command.provider,
      command.rawBody,
      command.headers,
    );

    if (!event) {
      this.logger.warn(`Ignoring unverified ${command.provider} webhook`);
      return;
    }

    const payment =
      (event.paymentId
        ? await this.payments.findById(PaymentId.restore(event.paymentId))
        : null) ??
      (await this.payments.findByProviderPaymentId(event.providerPaymentId)) ??
      (event.orderId ? await this.payments.findByOrderId(event.orderId) : null);

    if (!payment) {
      throw new PaymentNotFoundException(
        event.paymentId ?? event.providerPaymentId,
      );
    }

    if (event.type === 'succeeded') {
      if (payment.status === PaymentStatus.SUCCEEDED) {
        return;
      }

      payment.markSucceeded(event.providerPaymentId);
      await this.payments.save(payment);

      const payload: PaymentSucceededEvent = {
        paymentId: payment.id.value,
        orderId: payment.orderId,
        provider: payment.provider,
        providerPaymentId: payment.providerPaymentId ?? event.providerPaymentId,
        amountMinor: payment.amount.amount,
        currency: payment.amount.currency,
        occurredAt: new Date().toISOString(),
      };
      await this.eventPublisher.publish(EVENT_NAMES.PAYMENT_SUCCEEDED, payload);
      return;
    }

    if (event.type === 'failed') {
      if (
        payment.status === PaymentStatus.FAILED ||
        payment.status === PaymentStatus.SUCCEEDED
      ) {
        return;
      }

      payment.markFailed(event.reason ?? 'Payment failed at provider');
      await this.payments.save(payment);

      const payload: PaymentFailedEvent = {
        paymentId: payment.id.value,
        orderId: payment.orderId,
        provider: payment.provider,
        reason: event.reason,
        occurredAt: new Date().toISOString(),
      };
      await this.eventPublisher.publish(EVENT_NAMES.PAYMENT_FAILED, payload);
      return;
    }

    if (event.type === 'refunded') {
      if (payment.status === PaymentStatus.REFUNDED) {
        return;
      }

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        this.logger.warn(
          `Skipping refund webhook for payment ${payment.id.value} in status ${payment.status}`,
        );
        return;
      }

      payment.refund();
      await this.payments.save(payment);

      const payload: PaymentRefundedEvent = {
        paymentId: payment.id.value,
        orderId: payment.orderId,
        provider: payment.provider,
        providerPaymentId: payment.providerPaymentId ?? event.providerPaymentId,
        amountMinor: payment.amount.amount,
        currency: payment.amount.currency,
        occurredAt: new Date().toISOString(),
      };
      await this.eventPublisher.publish(EVENT_NAMES.PAYMENT_REFUNDED, payload);
    }
  }
}
