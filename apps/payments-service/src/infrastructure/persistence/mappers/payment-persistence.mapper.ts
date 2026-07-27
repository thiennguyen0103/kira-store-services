import { Injectable } from '@nestjs/common';
import { PaymentDto } from 'apps/payments-service/src/application/dto/payment.dto';
import { Payment } from 'apps/payments-service/src/domain/entities/payment.entity';
import { CurrencyCode } from 'apps/payments-service/src/domain/enums/currency-code.enum';
import { Money } from 'apps/payments-service/src/domain/value-objects/money.vo';
import { PaymentId } from 'apps/payments-service/src/domain/value-objects/payment-id.vo';
import { PaymentOrmEntity } from '../entities/payment.orm-entity';

@Injectable()
export class PaymentPersistenceMapper {
  toDto(orm: PaymentOrmEntity): PaymentDto {
    return new PaymentDto(
      orm.id,
      orm.orderId,
      orm.status,
      orm.provider,
      orm.providerPaymentId,
      Number(orm.amountMinor),
      orm.currency,
      orm.checkoutUrl,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  toDomain(orm: PaymentOrmEntity): Payment {
    return Payment.restore(PaymentId.restore(orm.id), {
      orderId: orm.orderId,
      status: orm.status,
      provider: orm.provider,
      amount: Money.restore(
        Number(orm.amountMinor),
        orm.currency as CurrencyCode,
      ),
      providerPaymentId: orm.providerPaymentId ?? undefined,
      checkoutUrl: orm.checkoutUrl ?? undefined,
      customerId: orm.customerId ?? undefined,
      description: orm.description ?? undefined,
      failureReason: orm.failureReason ?? undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  toOrm(payment: Payment): PaymentOrmEntity {
    const orm = new PaymentOrmEntity();
    orm.id = payment.id.value;
    orm.orderId = payment.orderId;
    orm.status = payment.status;
    orm.provider = payment.provider;
    orm.providerPaymentId = payment.providerPaymentId ?? null;
    orm.amountMinor = String(payment.amount.amount);
    orm.currency = payment.amount.currency;
    orm.checkoutUrl = payment.checkoutUrl ?? null;
    orm.customerId = payment.customerId ?? null;
    orm.description = payment.description ?? null;
    orm.failureReason = payment.failureReason ?? null;
    orm.createdAt = payment.createdAt;
    orm.updatedAt = payment.updatedAt;
    return orm;
  }
}
