import { Observable } from 'rxjs';
import type {
  CreatePaymentIntentRequest,
  GetPaymentByOrderIdRequest,
  GetPaymentRequest,
  PaymentResponse,
  PingResponse,
  RefundPaymentRequest,
} from 'libs/shared/generated/payments';

export abstract class PaymentsClientPort {
  abstract ping(): Observable<PingResponse>;

  abstract createPaymentIntent(
    request: CreatePaymentIntentRequest,
  ): Observable<PaymentResponse>;

  abstract getPayment(request: GetPaymentRequest): Observable<PaymentResponse>;

  abstract getPaymentByOrderId(
    request: GetPaymentByOrderIdRequest,
  ): Observable<PaymentResponse>;

  abstract refundPayment(
    request: RefundPaymentRequest,
  ): Observable<PaymentResponse>;
}
