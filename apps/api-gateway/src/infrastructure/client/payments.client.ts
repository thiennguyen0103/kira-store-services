import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type {
  PaymentsGrpcService,
  PingResponse,
} from 'libs/shared/microservices';
import { PaymentsClientPort } from '../../application/ports/payments-client.port';

@Injectable()
export class PaymentsClient extends PaymentsClientPort implements OnModuleInit {
  private paymentsService!: PaymentsGrpcService;

  constructor(
    @Inject(SERVICE_TOKENS.PAYMENTS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.paymentsService = this.client.getService<PaymentsGrpcService>(
      GRPC_SERVICE_NAMES.PAYMENTS,
    );
  }

  ping(): Observable<PingResponse> {
    return this.paymentsService.ping({});
  }
}
