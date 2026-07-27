import { PaymentProvider } from 'libs/shared/enums';

export type NormalizedPaymentEventType = 'succeeded' | 'failed' | 'refunded';

export interface NormalizedPaymentEvent {
  type: NormalizedPaymentEventType;
  providerPaymentId: string;
  orderId?: string;
  paymentId?: string;
  amountMinor?: number;
  currency?: string;
  reason?: string;
}

export interface CreateCheckoutInput {
  orderId: string;
  amountMinor: number;
  currency: string;
  provider: PaymentProvider;
  description?: string;
  successUrl: string;
  cancelUrl: string;
  paymentId: string;
}

export interface CreateCheckoutResult {
  providerPaymentId: string;
  checkoutUrl: string;
}

export interface RefundInput {
  provider: PaymentProvider;
  providerPaymentId: string;
  amountMinor: number;
  currency: string;
}

export abstract class PaymentGatewayPort {
  abstract createCheckout(
    input: CreateCheckoutInput,
  ): Promise<CreateCheckoutResult>;

  abstract refund(input: RefundInput): Promise<void>;

  abstract verifyWebhook(
    provider: PaymentProvider,
    rawBody: Buffer | string,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<NormalizedPaymentEvent | null>;
}
