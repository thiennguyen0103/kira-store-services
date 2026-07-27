import { Injectable, Logger } from '@nestjs/common';
import {
  CreateCheckoutInput,
  CreateCheckoutResult,
  NormalizedPaymentEvent,
  RefundInput,
} from 'apps/payments-service/src/application/ports/payment-gateway.port';
import { PayOsClient } from './payos.client';

@Injectable()
export class PayOsPaymentGateway {
  private readonly logger = new Logger(PayOsPaymentGateway.name);

  constructor(private readonly payOsClient: PayOsClient) {}

  isConfigured(): boolean {
    return this.payOsClient.isConfigured();
  }

  async createCheckout(
    input: CreateCheckoutInput,
  ): Promise<CreateCheckoutResult> {
    const payos = this.payOsClient.getOrThrow();
    const orderCode = this.toOrderCode(input.paymentId);

    const result = await payos.paymentRequests.create({
      orderCode,
      amount: input.amountMinor,
      description: (input.description || `Order ${input.orderId}`).slice(0, 25),
      returnUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      items: [
        {
          name: (input.description || `Order ${input.orderId}`).slice(0, 50),
          quantity: 1,
          price: input.amountMinor,
        },
      ],
    });

    return {
      providerPaymentId: result.paymentLinkId,
      checkoutUrl: result.checkoutUrl,
    };
  }

  async refund(input: RefundInput): Promise<void> {
    const payos = this.payOsClient.getOrThrow();
    try {
      await payos.paymentRequests.cancel(
        input.providerPaymentId,
        'Refund requested',
      );
    } catch (error) {
      this.logger.warn(
        `PayOS cancel/refund for ${input.providerPaymentId} failed: ${
          error instanceof Error ? error.message : String(error)
        }. Marking refund in domain; settle manually in PayOS if already paid.`,
      );
    }
  }

  async verifyWebhook(
    rawBody: Buffer | string,
    _headers: Record<string, string | string[] | undefined>,
  ): Promise<NormalizedPaymentEvent | null> {
    const payos = this.payOsClient.getOrThrow();
    const parsed: unknown =
      typeof rawBody === 'string'
        ? JSON.parse(rawBody)
        : JSON.parse(rawBody.toString('utf8'));

    try {
      const data = (await payos.webhooks.verify(
        parsed as Parameters<typeof payos.webhooks.verify>[0],
      )) as {
        code: string;
        paymentLinkId: string;
        amount: number;
        currency?: string;
        desc?: string;
      };
      const success = data.code === '00';

      return {
        type: success ? 'succeeded' : 'failed',
        providerPaymentId: data.paymentLinkId,
        amountMinor: data.amount,
        currency: data.currency?.toUpperCase(),
        reason: success ? undefined : data.desc,
      };
    } catch (error) {
      this.logger.warn(
        `PayOS webhook verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private toOrderCode(paymentId: string): number {
    const hex = paymentId.replace(/-/g, '').slice(0, 12);
    const parsed = Number.parseInt(hex, 16);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return Date.now() % 1_000_000_000_000;
    }
    return parsed % 1_000_000_000_000;
  }
}
