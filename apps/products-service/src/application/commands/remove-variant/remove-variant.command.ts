export class RemoveVariantCommand {
  constructor(
    public readonly productId: string,
    public readonly variantId: string,
  ) {}
}
