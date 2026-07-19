export const QUEUE_NAMES = {
  USERS: 'users_queue',
  ORDERS: 'orders_queue',
  PAYMENTS: 'payments_queue',
  PRODUCTS: 'products_queue',
  IDENTITY: 'identity_queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
