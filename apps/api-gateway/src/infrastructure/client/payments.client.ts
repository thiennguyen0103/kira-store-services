import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
import type {
  CreatePaymentIntentRequest,
  GetPaymentByOrderIdRequest,
  GetPaymentRequest,
  PaymentResponse,
  PaymentsServiceClient,
  PingResponse,
  RefundPaymentRequest,
} from 'libs/shared/generated/payments';
import { PaymentsClientPort } from '../../application/ports/payments-client.port';

@Injectable()
export class PaymentsClient extends PaymentsClientPort implements OnModuleInit {
  private paymentsService!: PaymentsServiceClient;

  constructor(
    @Inject(SERVICE_TOKENS.PAYMENTS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.paymentsService = this.client.getService<PaymentsServiceClient>(
      GRPC_SERVICE_NAMES.PAYMENTS,
    );
  }

  ping(): Observable<PingResponse> {
    return this.paymentsService.ping({});
  }

  createPaymentIntent(
    request: CreatePaymentIntentRequest,
  ): Observable<PaymentResponse> {
    return this.paymentsService.createPaymentIntent(request);
  }

  getPayment(request: GetPaymentRequest): Observable<PaymentResponse> {
    return this.paymentsService.getPayment(request);
  }

  getPaymentByOrderId(
    request: GetPaymentByOrderIdRequest,
  ): Observable<PaymentResponse> {
    return this.paymentsService.getPaymentByOrderId(request);
  }

  refundPayment(request: RefundPaymentRequest): Observable<PaymentResponse> {
    return this.paymentsService.refundPayment(request);
  }
}
