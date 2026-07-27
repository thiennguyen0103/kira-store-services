import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentDto } from 'apps/payments-service/src/application/dto/payment.dto';
import { PaymentGatewayPort } from 'apps/payments-service/src/application/ports/payment-gateway.port';
import { Payment } from 'apps/payments-service/src/domain/entities/payment.entity';
import { PaymentNotFoundException } from 'apps/payments-service/src/domain/exceptions/payment-not-found.exception';
import { PaymentRepository } from 'apps/payments-service/src/domain/repositories/payment.repository';
import { PaymentId } from 'apps/payments-service/src/domain/value-objects/payment-id.vo';
import { EVENT_NAMES } from 'libs/shared/constants';
import { PaymentStatus } from 'libs/shared/enums';
import type { PaymentRefundedEvent } from 'libs/shared/events';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { EventPublisher } from 'libs/shared/interfaces';
import { RefundPaymentCommand } from './refund-payment.command';

@CommandHandler(RefundPaymentCommand)
export class RefundPaymentHandler implements ICommandHandler<RefundPaymentCommand> {
  constructor(
    private readonly payments: PaymentRepository,
    private readonly gateway: PaymentGatewayPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RefundPaymentCommand): Promise<PaymentDto> {
    const payment = await this.resolvePayment(command);

    if (payment.status === PaymentStatus.REFUNDED) {
      return this.toDto(payment);
    }

    if (!payment.providerPaymentId) {
      throw new DomainException('Payment has no provider payment id.', {
        code: 'MISSING_PROVIDER_PAYMENT_ID',
        details: { paymentId: payment.id.value },
      });
    }

    await this.gateway.refund({
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      amountMinor: payment.amount.amount,
      currency: payment.amount.currency,
    });

    payment.refund();
    await this.payments.save(payment);

    const payload: PaymentRefundedEvent = {
      paymentId: payment.id.value,
      orderId: payment.orderId,
      provider: payment.provider,
      providerPaymentId: payment.providerPaymentId,
      amountMinor: payment.amount.amount,
      currency: payment.amount.currency,
      occurredAt: new Date().toISOString(),
    };
    await this.eventPublisher.publish(EVENT_NAMES.PAYMENT_REFUNDED, payload);

    return this.toDto(payment);
  }

  private async resolvePayment(
    command: RefundPaymentCommand,
  ): Promise<Payment> {
    if (command.paymentId) {
      const payment = await this.payments.findById(
        PaymentId.restore(command.paymentId),
      );
      if (!payment) {
        throw new PaymentNotFoundException(command.paymentId);
      }
      return payment;
    }

    if (command.orderId) {
      const payment = await this.payments.findByOrderId(command.orderId);
      if (!payment) {
        throw new PaymentNotFoundException(command.orderId);
      }
      return payment;
    }

    throw new DomainException('paymentId or orderId is required.', {
      code: 'INVALID_REFUND_REQUEST',
    });
  }

  private toDto(payment: Payment): PaymentDto {
    return new PaymentDto(
      payment.id.value,
      payment.orderId,
      payment.status,
      payment.provider,
      payment.providerPaymentId ?? null,
      payment.amount.amount,
      payment.amount.currency,
      payment.checkoutUrl ?? null,
      payment.createdAt,
      payment.updatedAt,
    );
  }
}
