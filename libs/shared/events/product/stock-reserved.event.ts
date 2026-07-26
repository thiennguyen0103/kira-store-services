export interface StockReservedEvent {
  orderId?: string;
  productId: string;
  variantId: string;
  quantity: number;
  occurredAt: string;
}
