import type { OrderStockItem } from './order-created.event';

export interface OrderCancelledEvent {
  orderId: string;
  items: OrderStockItem[];
  occurredAt: string;
}
