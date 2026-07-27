import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MoneyResponseDto {
  @ApiProperty({ example: 1999 })
  amountMinor!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}

export class VariantResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'SKU-001' })
  sku!: string;

  @ApiProperty({ example: { color: 'red', size: 'M' } })
  options!: Record<string, string>;

  @ApiProperty({ type: MoneyResponseDto })
  price!: MoneyResponseDto;

  @ApiProperty({ example: 100 })
  onHand!: number;

  @ApiProperty({ example: 5 })
  reserved!: number;

  @ApiProperty({ example: 95 })
  available!: number;

  @ApiProperty({ example: '1234567890123' })
  barcode!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  updatedAt!: string;
}

export class ImageResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'https://cdn.example.com/image.jpg' })
  url!: string;

  @ApiProperty({ example: 'Front view' })
  alt!: string;

  @ApiProperty({ example: 0 })
  sortOrder!: number;

  @ApiProperty({ example: true })
  isPrimary!: boolean;
}

export class ProductResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Classic T-Shirt' })
  name!: string;

  @ApiProperty({ example: 'classic-t-shirt' })
  slug!: string;

  @ApiProperty({ example: 'Soft cotton tee' })
  description!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  categoryId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  brandId!: string;

  @ApiProperty({ type: [VariantResponseDto] })
  variants!: VariantResponseDto[];

  @ApiProperty({ type: [ImageResponseDto] })
  images!: ImageResponseDto[];

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  updatedAt!: string;
}

export class ProductListItemResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Classic T-Shirt' })
  name!: string;

  @ApiProperty({ example: 'classic-t-shirt' })
  slug!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  categoryId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  brandId!: string;

  @ApiProperty({ example: 'https://cdn.example.com/image.jpg' })
  primaryImageUrl!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  updatedAt!: string;
}

export class ListProductsResponseDto {
  @ApiProperty({ type: [ProductListItemResponseDto] })
  items!: ProductListItemResponseDto[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}

export class StockMutationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  orderId!: string;

  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Stock reserved' })
  message!: string;
}

export class BrandResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Acme' })
  name!: string;

  @ApiProperty({ example: 'acme' })
  slug!: string;

  @ApiProperty({ example: 'https://cdn.example.com/logo.png' })
  logoUrl!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  updatedAt!: string;
}

export class ListBrandsResponseDto {
  @ApiProperty({ type: [BrandResponseDto] })
  items!: BrandResponseDto[];

  @ApiProperty({ example: 10 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}

export class CategoryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Apparel' })
  name!: string;

  @ApiProperty({ example: 'apparel' })
  slug!: string;

  @ApiProperty({ example: '/apparel' })
  path!: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Empty string when this is a root category',
  })
  parentId!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: 0 })
  depth!: number;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  updatedAt!: string;
}

export class ListCategoriesResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  items!: CategoryResponseDto[];

  @ApiProperty({ example: 10 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}
