export class RefundPaymentCommand {
  constructor(
    public readonly paymentId?: string,
    public readonly orderId?: string,
    public readonly reason?: string,
  ) {}
}
