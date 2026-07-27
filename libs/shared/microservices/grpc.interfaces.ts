import type { Observable } from 'rxjs';

export type PingRequest = Record<string, never>;

export interface PingResponse {
  ok: boolean;
  service: string;
}

/** @deprecated Prefer UsersServiceClient from libs/shared/generated/users */
export interface UsersGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}

export interface OrdersGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}

export interface PaymentsGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}

/** @deprecated Prefer ProductsServiceClient from libs/shared/generated/products */
export interface ProductsGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}

/** @deprecated Prefer IdentityServiceClient from libs/shared/generated/identity */
export interface IdentityGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}
