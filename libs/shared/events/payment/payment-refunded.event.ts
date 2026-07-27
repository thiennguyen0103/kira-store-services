export interface PaymentRefundedEvent {
  paymentId: string;
  orderId: string;
  provider: string;
  providerPaymentId: string;
  amountMinor: number;
  currency: string;
  occurredAt: string;
}
