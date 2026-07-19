import { Observable } from 'rxjs';
import type { PingResponse } from 'libs/shared/microservices';

export abstract class PaymentsClientPort {
  abstract ping(): Observable<PingResponse>;
}
