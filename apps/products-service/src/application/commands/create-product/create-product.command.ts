export interface CreateVariantInput {
  sku: string;
  options: Record<string, string>;
  priceAmount: number;
  priceCurrency: string;
  onHand?: number;
  barcode?: string;
  isActive?: boolean;
}

export interface CreateImageInput {
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export class CreateProductCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly categoryId: string,
    public readonly description?: string,
    public readonly brandId?: string,
    public readonly variants: CreateVariantInput[] = [],
    public readonly images: CreateImageInput[] = [],
  ) {}
}
