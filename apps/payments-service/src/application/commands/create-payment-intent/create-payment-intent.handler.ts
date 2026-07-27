import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentDto } from 'apps/payments-service/src/application/dto/payment.dto';
import { PaymentGatewayPort } from 'apps/payments-service/src/application/ports/payment-gateway.port';
import { Payment } from 'apps/payments-service/src/domain/entities/payment.entity';
import { CurrencyCode } from 'apps/payments-service/src/domain/enums/currency-code.enum';
import { PaymentRepository } from 'apps/payments-service/src/domain/repositories/payment.repository';
import { Money } from 'apps/payments-service/src/domain/value-objects/money.vo';
import { PaymentId } from 'apps/payments-service/src/domain/value-objects/payment-id.vo';
import { EVENT_NAMES } from 'libs/shared/constants';
import { PaymentProvider, PaymentStatus } from 'libs/shared/enums';
import type { PaymentInitiatedEvent } from 'libs/shared/events';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { EventPublisher } from 'libs/shared/interfaces';
import { CreatePaymentIntentCommand } from './create-payment-intent.command';

@CommandHandler(CreatePaymentIntentCommand)
export class CreatePaymentIntentHandler implements ICommandHandler<CreatePaymentIntentCommand> {
  constructor(
    private readonly payments: PaymentRepository,
    private readonly gateway: PaymentGatewayPort,
    private readonly eventPublisher: EventPublisher,
    private readonly config: ConfigService,
  ) {}

  async execute(command: CreatePaymentIntentCommand): Promise<PaymentDto> {
    const provider = this.parseProvider(command.provider);
    const currency = this.parseCurrency(command.currency);
    const existing = await this.payments.findByOrderId(command.orderId);

    if (existing && existing.status === PaymentStatus.SUCCEEDED) {
      throw new DomainException('Order already has a successful payment.', {
        code: 'PAYMENT_ALREADY_SUCCEEDED',
        details: { orderId: command.orderId },
      });
    }

    if (
      existing &&
      existing.status === PaymentStatus.INITIATED &&
      existing.checkoutUrl
    ) {
      return this.toDto(existing);
    }

    const publicBase =
      this.config.get<string>('PAYMENTS_PUBLIC_BASE_URL') ??
      'http://localhost:3003';
    const successUrl =
      command.successUrl ||
      `${publicBase}/payments/success?orderId=${command.orderId}`;
    const cancelUrl =
      command.cancelUrl ||
      `${publicBase}/payments/cancel?orderId=${command.orderId}`;

    const payment =
      existing && existing.status === PaymentStatus.INITIATED
        ? existing
        : Payment.create(
            PaymentId.create(),
            command.orderId,
            Money.create(command.amountMinor, currency),
            provider,
            {
              customerId: command.customerId || undefined,
              description: command.description || undefined,
            },
          );

    if (!existing || existing.status !== PaymentStatus.INITIATED) {
      await this.payments.save(payment);
    }

    try {
      const checkout = await this.gateway.createCheckout({
        orderId: command.orderId,
        amountMinor: command.amountMinor,
        currency: currency,
        provider,
        description: command.description,
        successUrl,
        cancelUrl,
        paymentId: payment.id.value,
      });

      payment.attachCheckout(checkout.providerPaymentId, checkout.checkoutUrl);
      await this.payments.save(payment);

      const initiated: PaymentInitiatedEvent = {
        paymentId: payment.id.value,
        orderId: payment.orderId,
        provider: payment.provider,
        amountMinor: payment.amount.amount,
        currency: payment.amount.currency,
        checkoutUrl: checkout.checkoutUrl,
        occurredAt: new Date().toISOString(),
      };
      await this.eventPublisher.publish(
        EVENT_NAMES.PAYMENT_INITIATED,
        initiated,
      );

      return this.toDto(payment);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'Checkout creation failed';
      payment.markFailed(reason);
      await this.payments.save(payment);

      await this.eventPublisher.publish(EVENT_NAMES.PAYMENT_FAILED, {
        paymentId: payment.id.value,
        orderId: payment.orderId,
        provider: payment.provider,
        reason,
        occurredAt: new Date().toISOString(),
      });

      throw error;
    }
  }

  private parseProvider(value: string): PaymentProvider {
    const normalized = value?.trim().toUpperCase();
    const providers = Object.values(PaymentProvider) as string[];
    if (providers.includes(normalized)) {
      return normalized as PaymentProvider;
    }

    throw new DomainException('Unsupported payment provider.', {
      code: 'INVALID_PAYMENT_PROVIDER',
      details: { provider: value },
    });
  }

  private parseCurrency(value: string): CurrencyCode {
    const normalized = value?.trim().toUpperCase();
    const currencies = Object.values(CurrencyCode) as string[];
    if (currencies.includes(normalized)) {
      return normalized as CurrencyCode;
    }

    throw new DomainException('Unsupported currency.', {
      code: 'INVALID_CURRENCY',
      details: { currency: value },
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
