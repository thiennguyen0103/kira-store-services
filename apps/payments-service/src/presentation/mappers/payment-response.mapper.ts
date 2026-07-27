import { PaymentDto } from 'apps/payments-service/src/application/dto/payment.dto';
import type { PaymentResponse } from 'libs/shared/generated/payments';

export class PaymentResponseMapper {
  static toGrpc(dto: PaymentDto): PaymentResponse {
    return {
      id: dto.id,
      orderId: dto.orderId,
      status: dto.status,
      provider: dto.provider,
      providerPaymentId: dto.providerPaymentId ?? '',
      amountMinor: dto.amountMinor,
      currency: dto.currency,
      checkoutUrl: dto.checkoutUrl ?? '',
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }
}
