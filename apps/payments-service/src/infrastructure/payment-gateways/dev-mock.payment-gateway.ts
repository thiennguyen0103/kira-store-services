import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateCheckoutInput,
  CreateCheckoutResult,
  NormalizedPaymentEvent,
  RefundInput,
} from 'apps/payments-service/src/application/ports/payment-gateway.port';

interface MockWebhookPayload {
  type?: NormalizedPaymentEvent['type'];
  providerPaymentId?: string;
  orderId?: string;
  paymentId?: string;
  amountMinor?: number;
  currency?: string;
  reason?: string;
}

@Injectable()
export class DevMockPaymentGateway {
  constructor(private readonly config: ConfigService) {}

  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const base =
      this.config.get<string>('PAYMENTS_PUBLIC_BASE_URL') ??
      'http://localhost:3003';
    const providerPaymentId = `mock_${input.provider.toLowerCase()}_${input.paymentId}`;

    return Promise.resolve({
      providerPaymentId,
      checkoutUrl: `${base}/mock-checkout/${input.paymentId}?orderId=${encodeURIComponent(input.orderId)}`,
    });
  }

  refund(_input: RefundInput): Promise<void> {
    return Promise.resolve();
  }

  verifyWebhook(
    rawBody: Buffer | string,
    _headers: Record<string, string | string[] | undefined>,
  ): Promise<NormalizedPaymentEvent | null> {
    try {
      const parsed: unknown =
        typeof rawBody === 'string'
          ? JSON.parse(rawBody)
          : JSON.parse(rawBody.toString('utf8'));
      const payload = parsed as MockWebhookPayload;

      if (!payload.type || !payload.providerPaymentId) {
        return Promise.resolve(null);
      }

      return Promise.resolve({
        type: payload.type,
        providerPaymentId: payload.providerPaymentId,
        orderId: payload.orderId,
        paymentId: payload.paymentId,
        amountMinor: payload.amountMinor,
        currency: payload.currency,
        reason: payload.reason,
      });
    } catch {
      return Promise.resolve(null);
    }
  }
}
