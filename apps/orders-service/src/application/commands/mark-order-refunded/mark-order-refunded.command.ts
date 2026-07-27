export class MarkOrderRefundedCommand {
  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
  ) {}
}
