export interface PaymentSucceededEvent {
  paymentId: string;
  orderId: string;
  provider: string;
  providerPaymentId: string;
  amountMinor: number;
  currency: string;
  occurredAt: string;
}
