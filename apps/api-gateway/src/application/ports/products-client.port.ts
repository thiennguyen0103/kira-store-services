import { Observable } from 'rxjs';
import type { PingResponse } from 'libs/shared/microservices';

export abstract class ProductsClientPort {
  abstract ping(): Observable<PingResponse>;
}
