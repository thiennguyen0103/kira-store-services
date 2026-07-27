import type { OrderStockItem } from '../order/order-created.event';

export interface StockReservationCompletedEvent {
  orderId: string;
  items: OrderStockItem[];
  occurredAt: string;
}
