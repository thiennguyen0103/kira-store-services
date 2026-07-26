export class UpdateVariantCommand {
  constructor(
    public readonly productId: string,
    public readonly variantId: string,
    public readonly options?: Record<string, string>,
    public readonly priceAmount?: number,
    public readonly priceCurrency?: string,
    public readonly barcode?: string,
    public readonly isActive?: boolean,
    public readonly clearBarcode?: boolean,
  ) {}
}
