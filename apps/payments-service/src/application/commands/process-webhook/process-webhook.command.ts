import { PaymentProvider } from 'libs/shared/enums';

export class ProcessWebhookCommand {
  constructor(
    public readonly provider: PaymentProvider,
    public readonly rawBody: Buffer | string,
    public readonly headers: Record<string, string | string[] | undefined>,
  ) {}
}
