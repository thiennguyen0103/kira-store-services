import { PaymentDto } from '../../dto/payment.dto';

export abstract class PaymentQueryRepository {
  abstract findById(paymentId: string): Promise<PaymentDto | null>;

  abstract findByOrderId(orderId: string): Promise<PaymentDto | null>;
}
