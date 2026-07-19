import { Observable } from 'rxjs';
import type { PingResponse } from 'libs/shared/microservices';

export abstract class OrdersClientPort {
  abstract ping(): Observable<PingResponse>;
}
