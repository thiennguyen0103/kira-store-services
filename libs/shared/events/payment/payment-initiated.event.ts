export interface PaymentInitiatedEvent {
  paymentId: string;
  orderId: string;
  provider: string;
  amountMinor: number;
  currency: string;
  checkoutUrl: string;
  occurredAt: string;
}
