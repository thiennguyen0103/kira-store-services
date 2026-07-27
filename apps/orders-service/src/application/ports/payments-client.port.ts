export interface CreatePaymentIntentInput {
  orderId: string;
  amountMinor: number;
  currency: string;
  provider: string;
  customerId: string;
  description?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentIntentResult {
  paymentId: string;
  checkoutUrl: string;
  status: string;
  provider: string;
}

export interface RefundPaymentInput {
  paymentId?: string;
  orderId?: string;
  reason?: string;
}

export interface RefundPaymentResult {
  paymentId: string;
  status: string;
  provider: string;
}

export abstract class PaymentsClientPort {
  abstract createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult>;

  abstract refundPayment(
    input: RefundPaymentInput,
  ): Promise<RefundPaymentResult>;
}
