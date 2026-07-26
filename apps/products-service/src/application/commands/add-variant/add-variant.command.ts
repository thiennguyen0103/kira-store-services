export class AddVariantCommand {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly options: Record<string, string>,
    public readonly priceAmount: number,
    public readonly priceCurrency: string,
    public readonly onHand?: number,
    public readonly barcode?: string,
    public readonly isActive?: boolean,
  ) {}
}
