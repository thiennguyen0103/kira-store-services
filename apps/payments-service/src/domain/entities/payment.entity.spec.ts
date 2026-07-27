import { PaymentProvider, PaymentStatus } from 'libs/shared/enums';
import { CurrencyCode } from '../enums/currency-code.enum';
import { Payment } from './payment.entity';
import { Money } from '../value-objects/money.vo';
import { PaymentId } from '../value-objects/payment-id.vo';

describe('Payment', () => {
  function createPayment(): Payment {
    return Payment.create(
      PaymentId.restore('01900000-0000-7000-8000-000000000001'),
      '01900000-0000-7000-8000-000000000002',
      Money.create(100_000, CurrencyCode.VND),
      PaymentProvider.PAYOS,
    );
  }

  it('markSucceeded is idempotent', () => {
    const payment = createPayment();
    payment.attachCheckout('prov_1', 'https://pay.example/checkout');
    payment.markSucceeded('prov_1');
    payment.markSucceeded('prov_1');

    expect(payment.status).toBe(PaymentStatus.SUCCEEDED);
  });

  it('markFailed is idempotent and does not override succeeded', () => {
    const payment = createPayment();
    payment.attachCheckout('prov_1', 'https://pay.example/checkout');
    payment.markFailed('declined');
    payment.markFailed('declined again');
    expect(payment.status).toBe(PaymentStatus.FAILED);

    const paid = createPayment();
    paid.attachCheckout('prov_2', 'https://pay.example/checkout');
    paid.markSucceeded('prov_2');
    expect(() => paid.markFailed('too late')).toThrow();
  });

  it('refund is idempotent', () => {
    const payment = createPayment();
    payment.attachCheckout('prov_1', 'https://pay.example/checkout');
    payment.markSucceeded('prov_1');
    payment.refund();
    payment.refund();
    expect(payment.status).toBe(PaymentStatus.REFUNDED);
  });
});
