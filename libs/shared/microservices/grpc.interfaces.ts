import type { Observable } from 'rxjs';

export type PingRequest = Record<string, never>;

export interface PingResponse {
  ok: boolean;
  service: string;
}

export interface UsersGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}

export interface OrdersGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}

export interface PaymentsGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}

export interface ProductsGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}

export interface IdentityGrpcService {
  ping(data: PingRequest): Observable<PingResponse>;
}
