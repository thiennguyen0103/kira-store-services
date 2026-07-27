import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateCheckoutInput,
  CreateCheckoutResult,
  NormalizedPaymentEvent,
  PaymentGatewayPort,
  RefundInput,
} from 'apps/payments-service/src/application/ports/payment-gateway.port';
import { PaymentProvider } from 'libs/shared/enums';
import { DevMockPaymentGateway } from './dev-mock.payment-gateway';
import { PayOsPaymentGateway } from './payos.payment-gateway';
import { StripePaymentGateway } from './stripe.payment-gateway';

@Injectable()
export class RoutingPaymentGateway extends PaymentGatewayPort {
  private readonly logger = new Logger(RoutingPaymentGateway.name);

  constructor(
    private readonly stripe: StripePaymentGateway,
    private readonly payos: PayOsPaymentGateway,
    private readonly mock: DevMockPaymentGateway,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async createCheckout(
    input: CreateCheckoutInput,
  ): Promise<CreateCheckoutResult> {
    return this.resolve(input.provider).createCheckout(input);
  }

  async refund(input: RefundInput): Promise<void> {
    return this.resolve(input.provider).refund(input);
  }

  async verifyWebhook(
    provider: PaymentProvider,
    rawBody: Buffer | string,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<NormalizedPaymentEvent | null> {
    return this.resolve(provider).verifyWebhook(rawBody, headers);
  }

  private resolve(provider: PaymentProvider): {
    createCheckout: (
      input: CreateCheckoutInput,
    ) => Promise<CreateCheckoutResult>;
    refund: (input: RefundInput) => Promise<void>;
    verifyWebhook: (
      rawBody: Buffer | string,
      headers: Record<string, string | string[] | undefined>,
    ) => Promise<NormalizedPaymentEvent | null>;
  } {
    const allowMock = this.config.get<string>('NODE_ENV') !== 'production';

    if (provider === PaymentProvider.STRIPE) {
      if (this.stripe.isConfigured()) {
        return this.stripe;
      }
      if (allowMock) {
        this.logger.warn('Using DevMock gateway for Stripe (keys missing)');
        return this.mock;
      }
      throw new Error('Stripe is not configured');
    }

    if (provider === PaymentProvider.PAYOS) {
      if (this.payos.isConfigured()) {
        return this.payos;
      }
      if (allowMock) {
        this.logger.warn('Using DevMock gateway for PayOS (keys missing)');
        return this.mock;
      }
      throw new Error('PayOS is not configured');
    }

    throw new Error(`Unsupported payment provider: ${String(provider)}`);
  }
}
