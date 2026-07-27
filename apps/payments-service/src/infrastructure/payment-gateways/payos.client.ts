import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';

@Injectable()
export class PayOsClient {
  private readonly logger = new Logger(PayOsClient.name);
  private readonly client: PayOS | null;

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('PAYOS_CLIENT_ID')?.trim();
    const apiKey = this.config.get<string>('PAYOS_API_KEY')?.trim();
    const checksumKey = this.config.get<string>('PAYOS_CHECKSUM_KEY')?.trim();

    this.client =
      clientId && apiKey && checksumKey
        ? new PayOS({ clientId, apiKey, checksumKey })
        : null;

    if (!this.client) {
      this.logger.warn('PayOS credentials incomplete; PayOS client disabled');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  getOrThrow(): PayOS {
    if (!this.client) {
      throw new Error(
        'PayOS is not configured (PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY)',
      );
    }
    return this.client;
  }
}
