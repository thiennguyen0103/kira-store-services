import { PaymentProvider, PaymentStatus } from 'libs/shared/enums';

export class PaymentDto {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly status: PaymentStatus,
    public readonly provider: PaymentProvider,
    public readonly providerPaymentId: string | null,
    public readonly amountMinor: number,
    public readonly currency: string,
    public readonly checkoutUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
