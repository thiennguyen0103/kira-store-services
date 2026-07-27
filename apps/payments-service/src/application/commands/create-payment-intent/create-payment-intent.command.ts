export class CreatePaymentIntentCommand {
  constructor(
    public readonly orderId: string,
    public readonly amountMinor: number,
    public readonly currency: string,
    public readonly provider: string,
    public readonly customerId?: string,
    public readonly description?: string,
    public readonly successUrl?: string,
    public readonly cancelUrl?: string,
  ) {}
}
