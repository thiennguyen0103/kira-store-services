export interface PaymentFailedEvent {
  paymentId: string;
  orderId: string;
  provider: string;
  reason?: string;
  occurredAt: string;
}
