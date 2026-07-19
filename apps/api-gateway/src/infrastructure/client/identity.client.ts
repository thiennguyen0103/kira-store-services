import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type {
  IdentityGrpcService,
  PingResponse,
} from 'libs/shared/microservices';
import { IdentityClientPort } from '../../application/ports/identity-client.port';

@Injectable()
export class IdentityClient extends IdentityClientPort implements OnModuleInit {
  private identityService!: IdentityGrpcService;

  constructor(
    @Inject(SERVICE_TOKENS.IDENTITY_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.identityService = this.client.getService<IdentityGrpcService>(
      GRPC_SERVICE_NAMES.IDENTITY,
    );
  }

  ping(): Observable<PingResponse> {
    return this.identityService.ping({});
  }
}
