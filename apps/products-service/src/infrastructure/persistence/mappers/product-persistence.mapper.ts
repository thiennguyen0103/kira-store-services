import { Injectable } from '@nestjs/common';
import {
  ProductDetailDto,
  ProductImageDto,
  ProductListItemDto,
  ProductVariantDto,
} from 'apps/products-service/src/application/dto/product.dto';
import { Product } from 'apps/products-service/src/domain/entities/product.entity';
import { ProductImage } from 'apps/products-service/src/domain/entities/product-image.entity';
import { ProductVariant } from 'apps/products-service/src/domain/entities/product-variant.entity';
import { CurrencyCode } from 'apps/products-service/src/domain/enums/currency-code.enum';
import { ProductStatus } from 'apps/products-service/src/domain/enums/product-status.enum';
import { BrandId } from 'apps/products-service/src/domain/value-objects/brand/brand-id.vo';
import { CategoryId } from 'apps/products-service/src/domain/value-objects/category/category-id.vo';
import { ImageId } from 'apps/products-service/src/domain/value-objects/product/image-id.vo';
import { ProductDescription } from 'apps/products-service/src/domain/value-objects/product/product-description.vo';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { ProductName } from 'apps/products-service/src/domain/value-objects/product/product-name.vo';
import { Sku } from 'apps/products-service/src/domain/value-objects/product/sku.vo';
import { VariantId } from 'apps/products-service/src/domain/value-objects/product/variant-id.vo';
import { VariantOptions } from 'apps/products-service/src/domain/value-objects/product/variant-options.vo';
import { ImageUrl } from 'apps/products-service/src/domain/value-objects/shared/image-url.vo';
import { Money } from 'apps/products-service/src/domain/value-objects/shared/money.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { StockLevel } from 'apps/products-service/src/domain/value-objects/shared/stock-level.vo';
import { ProductImageOrmEntity } from '../entities/product-image.orm-entity';
import { ProductVariantOrmEntity } from '../entities/product-variant.orm-entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';

@Injectable()
export class ProductPersistenceMapper {
  toDetailDto(product: ProductOrmEntity): ProductDetailDto {
    return new ProductDetailDto(
      product.id,
      product.name,
      product.slug,
      product.description,
      product.status,
      product.categoryId,
      product.brandId,
      (product.variants ?? []).map((v) => this.toVariantDto(v)),
      (product.images ?? []).map((i) => this.toImageDto(i)),
      product.createdAt,
      product.updatedAt,
    );
  }

  toDetailDtoFromDomain(product: Product): ProductDetailDto {
    return new ProductDetailDto(
      product.id.value,
      product.name.value,
      product.slug.value,
      product.description?.value ?? null,
      product.status,
      product.categoryId.value,
      product.brandId?.value ?? null,
      product.variants.map(
        (v) =>
          new ProductVariantDto(
            v.id.value,
            v.sku.value,
            { ...v.options.values },
            v.price.amount,
            v.price.currency,
            v.stock.onHand,
            v.stock.reserved,
            v.stock.available,
            v.barcode ?? null,
            v.isActive,
            v.createdAt,
            v.updatedAt,
          ),
      ),
      product.images.map(
        (i) =>
          new ProductImageDto(
            i.id.value,
            i.url.value,
            i.alt ?? null,
            i.sortOrder,
            i.isPrimary,
          ),
      ),
      product.createdAt,
      product.updatedAt,
    );
  }

  toListItemDto(product: ProductOrmEntity): ProductListItemDto {
    const primary =
      (product.images ?? []).find((i) => i.isPrimary) ??
      (product.images ?? [])[0];

    return new ProductListItemDto(
      product.id,
      product.name,
      product.slug,
      product.status,
      product.categoryId,
      product.brandId,
      primary?.url ?? null,
      product.createdAt,
      product.updatedAt,
    );
  }

  toVariantDto(variant: ProductVariantOrmEntity): ProductVariantDto {
    const onHand = variant.stockOnHand;
    const reserved = variant.stockReserved;
    return new ProductVariantDto(
      variant.id,
      variant.sku,
      variant.options ?? {},
      Number(variant.priceAmount),
      variant.priceCurrency,
      onHand,
      reserved,
      onHand - reserved,
      variant.barcode,
      variant.isActive,
      variant.createdAt,
      variant.updatedAt,
    );
  }

  toImageDto(image: ProductImageOrmEntity): ProductImageDto {
    return new ProductImageDto(
      image.id,
      image.url,
      image.alt,
      image.sortOrder,
      image.isPrimary,
    );
  }

  toDomain(product: ProductOrmEntity): Product {
    return Product.restore(ProductId.restore(product.id), {
      name: ProductName.restore(product.name),
      slug: Slug.restore(product.slug),
      description: product.description
        ? ProductDescription.restore(product.description)
        : undefined,
      status: product.status as ProductStatus,
      categoryId: CategoryId.restore(product.categoryId),
      brandId: product.brandId ? BrandId.restore(product.brandId) : undefined,
      variants: (product.variants ?? []).map((v) => this.toVariantDomain(v)),
      images: (product.images ?? []).map((i) => this.toImageDomain(i)),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  toVariantDomain(variant: ProductVariantOrmEntity): ProductVariant {
    return ProductVariant.restore(VariantId.restore(variant.id), {
      sku: Sku.restore(variant.sku),
      options: VariantOptions.restore(variant.options ?? {}),
      price: Money.restore(
        Number(variant.priceAmount),
        variant.priceCurrency as CurrencyCode,
      ),
      stock: StockLevel.restore(variant.stockOnHand, variant.stockReserved),
      barcode: variant.barcode ?? undefined,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    });
  }

  toImageDomain(image: ProductImageOrmEntity): ProductImage {
    return ProductImage.restore(ImageId.restore(image.id), {
      url: ImageUrl.restore(image.url),
      alt: image.alt ?? undefined,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
    });
  }

  toProductOrm(product: Product): ProductOrmEntity {
    const orm = new ProductOrmEntity();
    orm.id = product.id.value;
    orm.name = product.name.value;
    orm.slug = product.slug.value;
    orm.description = product.description?.value ?? null;
    orm.status = product.status;
    orm.categoryId = product.categoryId.value;
    orm.brandId = product.brandId?.value ?? null;
    orm.createdAt = product.createdAt;
    orm.updatedAt = product.updatedAt;
    return orm;
  }

  toVariantOrm(
    variant: ProductVariant,
    productId: string,
  ): ProductVariantOrmEntity {
    const orm = new ProductVariantOrmEntity();
    orm.id = variant.id.value;
    orm.productId = productId;
    orm.sku = variant.sku.value;
    orm.options = { ...variant.options.values };
    orm.priceAmount = String(variant.price.amount);
    orm.priceCurrency = variant.price.currency;
    orm.stockOnHand = variant.stock.onHand;
    orm.stockReserved = variant.stock.reserved;
    orm.barcode = variant.barcode ?? null;
    orm.isActive = variant.isActive;
    orm.createdAt = variant.createdAt;
    orm.updatedAt = variant.updatedAt;
    return orm;
  }

  toImageOrm(image: ProductImage, productId: string): ProductImageOrmEntity {
    const orm = new ProductImageOrmEntity();
    orm.id = image.id.value;
    orm.productId = productId;
    orm.url = image.url.value;
    orm.alt = image.alt ?? null;
    orm.sortOrder = image.sortOrder;
    orm.isPrimary = image.isPrimary;
    return orm;
  }
}
