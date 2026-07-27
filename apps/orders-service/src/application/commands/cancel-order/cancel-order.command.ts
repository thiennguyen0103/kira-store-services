export class CancelOrderCommand {
  constructor(
    public readonly orderId: string,
    public readonly customerId?: string,
    public readonly reason?: string,
  ) {}
}
