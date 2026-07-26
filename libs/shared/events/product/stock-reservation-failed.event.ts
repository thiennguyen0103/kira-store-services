export interface StockReservationFailedEvent {
  orderId?: string;
  productId: string;
  variantId: string;
  quantity: number;
  available: number;
  occurredAt: string;
}
