export class AdjustStockCommand {
  constructor(
    public readonly productId: string,
    public readonly variantId: string,
    public readonly delta: number,
  ) {}
}
