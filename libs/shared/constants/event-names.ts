export const EVENT_NAMES = {
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_PAYMENT_PENDING: 'order.payment_pending',
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  STOCK_RESERVED: 'product.stock_reserved',
  STOCK_RESERVATION_FAILED: 'product.stock_reservation_failed',
  STOCK_RELEASED: 'product.stock_released',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
