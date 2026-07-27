export class CreateOrderCommand {
  constructor(
    public readonly customerId: string,
    public readonly addressId: string,
    public readonly paymentProvider: string,
  ) {}
}
