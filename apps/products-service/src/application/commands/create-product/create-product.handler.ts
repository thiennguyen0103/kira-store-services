import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductDetailDto } from 'apps/products-service/src/application/dto/product.dto';
import { Product } from 'apps/products-service/src/domain/entities/product.entity';
import { ProductImage } from 'apps/products-service/src/domain/entities/product-image.entity';
import { ProductVariant } from 'apps/products-service/src/domain/entities/product-variant.entity';
import { CurrencyCode } from 'apps/products-service/src/domain/enums/currency-code.enum';
import { BrandNotFoundException } from 'apps/products-service/src/domain/exceptions/brand-not-found.exception';
import { CategoryNotFoundException } from 'apps/products-service/src/domain/exceptions/category-not-found.exception';
import { DuplicateSlugException } from 'apps/products-service/src/domain/exceptions/duplicate-slug.exception';
import { BrandRepository } from 'apps/products-service/src/domain/repositories/brand.repository';
import { CategoryRepository } from 'apps/products-service/src/domain/repositories/category.repository';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
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
import { ProductPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/product-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { ProductCreatedEvent } from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import {
  CreateImageInput,
  CreateProductCommand,
  CreateVariantInput,
} from './create-product.command';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
    private readonly brands: BrandRepository,
    private readonly mapper: ProductPersistenceMapper,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateProductCommand): Promise<ProductDetailDto> {
    const slug = Slug.create(command.slug);
    if (await this.products.existsBySlug(slug)) {
      throw new DuplicateSlugException(slug.value);
    }

    const category = await this.categories.findById(
      CategoryId.restore(command.categoryId),
    );
    if (!category) {
      throw new CategoryNotFoundException(command.categoryId);
    }

    let brandId: BrandId | undefined;
    if (command.brandId) {
      const brand = await this.brands.findById(
        BrandId.restore(command.brandId),
      );
      if (!brand) {
        throw new BrandNotFoundException(command.brandId);
      }
      brandId = brand.id;
    }

    const product = Product.create(ProductId.create(), {
      name: ProductName.create(command.name),
      slug,
      categoryId: category.id,
      description: command.description
        ? ProductDescription.create(command.description)
        : undefined,
      brandId,
      variants: command.variants.map((v) => this.toVariant(v)),
      images: command.images.map((i) => this.toImage(i)),
    });

    await this.products.save(product);

    const payload: ProductCreatedEvent = {
      productId: product.id.value,
      occurredAt: new Date().toISOString(),
    };
    await this.eventPublisher.publish(EVENT_NAMES.PRODUCT_CREATED, payload);

    return this.mapper.toDetailDtoFromDomain(product);
  }

  private toVariant(input: CreateVariantInput): ProductVariant {
    return ProductVariant.create(VariantId.create(), {
      sku: Sku.create(input.sku),
      options: VariantOptions.create(input.options ?? {}),
      price: Money.create(
        input.priceAmount,
        input.priceCurrency as CurrencyCode,
      ),
      stock: StockLevel.create(input.onHand ?? 0),
      barcode: input.barcode,
      isActive: input.isActive,
    });
  }

  private toImage(input: CreateImageInput): ProductImage {
    return ProductImage.create(ImageId.create(), {
      url: ImageUrl.create(input.url),
      alt: input.alt,
      sortOrder: input.sortOrder,
      isPrimary: input.isPrimary,
    });
  }
}
