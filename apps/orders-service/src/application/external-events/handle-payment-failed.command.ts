export class HandlePaymentFailedCommand {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly provider: string,
    public readonly reason?: string,
  ) {}
}
