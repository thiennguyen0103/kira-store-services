import { BrandDto } from 'apps/products-service/src/application/dto/brand.dto';
import { CategoryDto } from 'apps/products-service/src/application/dto/category.dto';
import {
  ProductDetailDto,
  ProductImageDto,
  ProductListItemDto,
  ProductVariantDto,
} from 'apps/products-service/src/application/dto/product.dto';
import { StockMutationResult } from 'apps/products-service/src/application/commands/reserve-stock/reserve-stock.command';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import type {
  BrandResponse,
  CategoryResponse,
  Image,
  ListBrandsResponse,
  ListCategoriesResponse,
  ListProductsResponse,
  Money,
  ProductListItem,
  ProductResponse,
  StockMutationResponse,
  Variant,
} from 'libs/shared/generated/products';

export class ProductResponseMapper {
  static toProductResponse(dto: ProductDetailDto): ProductResponse {
    return {
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? '',
      status: dto.status,
      categoryId: dto.categoryId,
      brandId: dto.brandId ?? '',
      variants: dto.variants.map((variant) =>
        ProductResponseMapper.toVariant(variant),
      ),
      images: dto.images.map((image) => ProductResponseMapper.toImage(image)),
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }

  static toProductListItem(dto: ProductListItemDto): ProductListItem {
    return {
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      status: dto.status,
      categoryId: dto.categoryId,
      brandId: dto.brandId ?? '',
      primaryImageUrl: dto.primaryImageUrl ?? '',
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }

  static toListProductsResponse(
    result: PagedResultDto<ProductListItemDto>,
  ): ListProductsResponse {
    return {
      items: result.items.map((item) =>
        ProductResponseMapper.toProductListItem(item),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  static toBrandResponse(dto: BrandDto): BrandResponse {
    return {
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      logoUrl: dto.logoUrl ?? '',
      isActive: dto.isActive,
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }

  static toListBrandsResponse(
    result: PagedResultDto<BrandDto>,
  ): ListBrandsResponse {
    return {
      items: result.items.map((item) =>
        ProductResponseMapper.toBrandResponse(item),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  static toCategoryResponse(dto: CategoryDto): CategoryResponse {
    return {
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      path: dto.path,
      parentId: dto.parentId ?? '',
      isActive: dto.isActive,
      depth: dto.depth,
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }

  static toListCategoriesResponse(
    result: PagedResultDto<CategoryDto>,
  ): ListCategoriesResponse {
    return {
      items: result.items.map((item) =>
        ProductResponseMapper.toCategoryResponse(item),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  static toCategoryChildrenResponse(
    items: CategoryDto[],
  ): ListCategoriesResponse {
    return {
      items: items.map((item) =>
        ProductResponseMapper.toCategoryResponse(item),
      ),
      total: items.length,
      page: 1,
      limit: items.length || 1,
    };
  }

  static toStockMutationResponse(
    result: StockMutationResult,
  ): StockMutationResponse {
    return {
      orderId: result.orderId ?? '',
      success: result.success,
      message: result.message,
    };
  }

  private static toVariant(dto: ProductVariantDto): Variant {
    return {
      id: dto.id,
      sku: dto.sku,
      options: dto.options,
      price: ProductResponseMapper.toMoney(dto.priceAmount, dto.priceCurrency),
      onHand: dto.onHand,
      reserved: dto.reserved,
      available: dto.available,
      barcode: dto.barcode ?? '',
      isActive: dto.isActive,
      createdAt: dto.createdAt.toISOString(),
      updatedAt: dto.updatedAt.toISOString(),
    };
  }

  private static toImage(dto: ProductImageDto): Image {
    return {
      id: dto.id,
      url: dto.url,
      alt: dto.alt ?? '',
      sortOrder: dto.sortOrder,
      isPrimary: dto.isPrimary,
    };
  }

  private static toMoney(amountMinor: number, currency: string): Money {
    return { amountMinor, currency };
  }
}
