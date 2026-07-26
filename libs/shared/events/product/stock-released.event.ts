export interface StockReleasedEvent {
  orderId?: string;
  productId: string;
  variantId: string;
  quantity: number;
  occurredAt: string;
}
