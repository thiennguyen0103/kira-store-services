export const GRPC_PACKAGES = {
  USERS: 'users',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  PRODUCTS: 'products',
} as const;

export const GRPC_SERVICE_NAMES = {
  USERS: 'UsersService',
  ORDERS: 'OrdersService',
  PAYMENTS: 'PaymentsService',
  PRODUCTS: 'ProductsService',
} as const;

const DEFAULT_GRPC_URLS = {
  USERS: 'localhost:5001',
  ORDERS: 'localhost:5002',
  PAYMENTS: 'localhost:5003',
  PRODUCTS: 'localhost:5004',
} as const;

export function getGrpcUrls() {
  return {
    USERS: process.env.USERS_GRPC_URL ?? DEFAULT_GRPC_URLS.USERS,
    ORDERS: process.env.ORDERS_GRPC_URL ?? DEFAULT_GRPC_URLS.ORDERS,
    PAYMENTS: process.env.PAYMENTS_GRPC_URL ?? DEFAULT_GRPC_URLS.PAYMENTS,
    PRODUCTS: process.env.PRODUCTS_GRPC_URL ?? DEFAULT_GRPC_URLS.PRODUCTS,
  } as const;
}
