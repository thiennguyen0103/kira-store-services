import { Observable } from 'rxjs';
import type { PingResponse } from 'libs/shared/microservices';

export abstract class IdentityClientPort {
  abstract ping(): Observable<PingResponse>;
}
