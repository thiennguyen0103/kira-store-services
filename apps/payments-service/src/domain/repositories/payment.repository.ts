import { Payment } from '../entities/payment.entity';
import { PaymentId } from '../value-objects/payment-id.vo';

export abstract class PaymentRepository {
  abstract save(payment: Payment): Promise<void>;

  abstract findById(id: PaymentId): Promise<Payment | null>;

  abstract findByOrderId(orderId: string): Promise<Payment | null>;

  abstract findByProviderPaymentId(
    providerPaymentId: string,
  ): Promise<Payment | null>;
}
