export class ProductVariantDto {
  constructor(
    public readonly id: string,
    public readonly sku: string,
    public readonly options: Record<string, string>,
    public readonly priceAmount: number,
    public readonly priceCurrency: string,
    public readonly onHand: number,
    public readonly reserved: number,
    public readonly available: number,
    public readonly barcode: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class ProductImageDto {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly alt: string | null,
    public readonly sortOrder: number,
    public readonly isPrimary: boolean,
  ) {}
}

export class ProductDetailDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly status: string,
    public readonly categoryId: string,
    public readonly brandId: string | null,
    public readonly variants: ProductVariantDto[],
    public readonly images: ProductImageDto[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class ProductListItemDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly status: string,
    public readonly categoryId: string,
    public readonly brandId: string | null,
    public readonly primaryImageUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
