export class AdminRefundOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly reason?: string,
  ) {}
}
