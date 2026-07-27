export class HandlePaymentSucceededCommand {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly provider: string,
    public readonly providerPaymentId: string,
    public readonly amountMinor: number,
    public readonly currency: string,
  ) {}
}
