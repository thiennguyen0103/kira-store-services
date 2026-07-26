export interface OrderStockItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface OrderCreatedEvent {
  orderId: string;
  items: OrderStockItem[];
  occurredAt: string;
}
