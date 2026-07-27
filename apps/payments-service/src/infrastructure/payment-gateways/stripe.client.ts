import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeClient {
  private readonly logger = new Logger(StripeClient.name);
  private readonly client: Stripe | null;

  constructor(private readonly config: ConfigService) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY')?.trim();
    this.client = secretKey ? new Stripe(secretKey) : null;

    if (!this.client) {
      this.logger.warn('STRIPE_SECRET_KEY is empty; Stripe client disabled');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  getOrThrow(): Stripe {
    if (!this.client) {
      throw new Error('Stripe is not configured (STRIPE_SECRET_KEY missing)');
    }
    return this.client;
  }

  getWebhookSecret(): string | undefined {
    return (
      this.config.get<string>('STRIPE_WEBHOOK_SECRET')?.trim() || undefined
    );
  }
}
