import { Observable } from 'rxjs';
import type { PingResponse } from 'libs/shared/microservices';

export abstract class UsersClientPort {
  abstract ping(): Observable<PingResponse>;
}
