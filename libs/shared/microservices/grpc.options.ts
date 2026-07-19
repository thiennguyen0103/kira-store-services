import { join } from 'node:path';
import { Transport, type GrpcOptions } from '@nestjs/microservices';

export type GrpcServiceKey =
  'users' | 'orders' | 'payments' | 'products' | 'identity';

const PROTO_FILE: Record<GrpcServiceKey, string> = {
  users: 'users.proto',
  orders: 'orders.proto',
  payments: 'payments.proto',
  products: 'products.proto',
  identity: 'identity.proto',
};

const PACKAGE_NAME: Record<GrpcServiceKey, string> = {
  users: 'users',
  orders: 'orders',
  payments: 'payments',
  products: 'products',
  identity: 'identity',
};

/** Resolve proto path from monorepo root (works for nest start / dist). */
export function getProtoPath(service: GrpcServiceKey): string {
  return join(process.cwd(), 'libs/shared/proto', PROTO_FILE[service]);
}

export function createGrpcOptions(
  service: GrpcServiceKey,
  url: string,
): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: PACKAGE_NAME[service],
      protoPath: getProtoPath(service),
      url,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  };
}
