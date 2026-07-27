export class UpdateCartItemCommand {
  constructor(
    public readonly customerId: string,
    public readonly productId: string,
    public readonly variantId: string,
    public readonly quantity: number,
  ) {}
}
