import { Injectable, Logger } from '@nestjs/common';
import {
  CreateCheckoutInput,
  CreateCheckoutResult,
  NormalizedPaymentEvent,
  RefundInput,
} from 'apps/payments-service/src/application/ports/payment-gateway.port';
import { StripeClient } from './stripe.client';

@Injectable()
export class StripePaymentGateway {
  private readonly logger = new Logger(StripePaymentGateway.name);

  constructor(private readonly stripeClient: StripeClient) {}

  isConfigured(): boolean {
    return this.stripeClient.isConfigured();
  }

  async createCheckout(
    input: CreateCheckoutInput,
  ): Promise<CreateCheckoutResult> {
    const stripe = this.stripeClient.getOrThrow();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: input.paymentId,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: input.amountMinor,
            product_data: {
              name: input.description || `Order ${input.orderId}`,
            },
          },
        },
      ],
      metadata: {
        orderId: input.orderId,
        paymentId: input.paymentId,
      },
      payment_intent_data: {
        metadata: {
          orderId: input.orderId,
          paymentId: input.paymentId,
        },
      },
    });

    if (!session.url) {
      throw new Error('Stripe Checkout Session did not return a URL');
    }

    return {
      providerPaymentId: session.id,
      checkoutUrl: session.url,
    };
  }

  async refund(input: RefundInput): Promise<void> {
    const stripe = this.stripeClient.getOrThrow();
    const session = await stripe.checkout.sessions.retrieve(
      input.providerPaymentId,
    );

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!paymentIntentId) {
      throw new Error(
        `Stripe session ${input.providerPaymentId} has no payment_intent to refund`,
      );
    }

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: input.amountMinor,
    });
  }

  verifyWebhook(
    rawBody: Buffer | string,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<NormalizedPaymentEvent | null> {
    const stripe = this.stripeClient.getOrThrow();
    const webhookSecret = this.stripeClient.getWebhookSecret();
    const signatureHeader = headers['stripe-signature'];
    const signature = Array.isArray(signatureHeader)
      ? signatureHeader[0]
      : signatureHeader;

    if (!webhookSecret || !signature) {
      this.logger.warn('Stripe webhook secret or signature missing');
      return Promise.resolve(null);
    }

    const payload =
      typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

    let event: {
      type: string;
      data: { object: unknown };
    };
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.warn(
        `Stripe webhook signature verification failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return Promise.resolve(null);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        id: string;
        metadata?: Record<string, string> | null;
        amount_total?: number | null;
        currency?: string | null;
      };

      return Promise.resolve({
        type: 'succeeded',
        providerPaymentId: session.id,
        orderId: session.metadata?.orderId,
        paymentId: session.metadata?.paymentId,
        amountMinor: session.amount_total ?? undefined,
        currency: session.currency?.toUpperCase(),
      });
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as {
        id: string;
        metadata?: Record<string, string> | null;
        amount?: number;
        currency?: string;
        last_payment_error?: { message?: string } | null;
      };

      return Promise.resolve({
        type: 'failed',
        providerPaymentId: intent.id,
        orderId: intent.metadata?.orderId,
        paymentId: intent.metadata?.paymentId,
        amountMinor: intent.amount,
        currency: intent.currency?.toUpperCase(),
        reason: intent.last_payment_error?.message,
      });
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as {
        id: string;
        payment_intent?: string | { id: string } | null;
        metadata?: Record<string, string> | null;
        amount_refunded?: number;
        currency?: string;
      };

      const paymentIntentId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

      return Promise.resolve({
        type: 'refunded',
        providerPaymentId: paymentIntentId ?? charge.id,
        orderId: charge.metadata?.orderId,
        paymentId: charge.metadata?.paymentId,
        amountMinor: charge.amount_refunded,
        currency: charge.currency?.toUpperCase(),
      });
    }

    this.logger.debug(`Ignoring Stripe event type ${event.type}`);
    return Promise.resolve(null);
  }
}
