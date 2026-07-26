import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductDetailDto } from 'apps/products-service/src/application/dto/product.dto';
import { BrandNotFoundException } from 'apps/products-service/src/domain/exceptions/brand-not-found.exception';
import { CategoryNotFoundException } from 'apps/products-service/src/domain/exceptions/category-not-found.exception';
import { DuplicateSlugException } from 'apps/products-service/src/domain/exceptions/duplicate-slug.exception';
import { ProductNotFoundException } from 'apps/products-service/src/domain/exceptions/product-not-found.exception';
import { BrandRepository } from 'apps/products-service/src/domain/repositories/brand.repository';
import { CategoryRepository } from 'apps/products-service/src/domain/repositories/category.repository';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { BrandId } from 'apps/products-service/src/domain/value-objects/brand/brand-id.vo';
import { CategoryId } from 'apps/products-service/src/domain/value-objects/category/category-id.vo';
import { ProductDescription } from 'apps/products-service/src/domain/value-objects/product/product-description.vo';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { ProductName } from 'apps/products-service/src/domain/value-objects/product/product-name.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { ProductPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/product-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { ProductUpdatedEvent } from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import { UpdateProductCommand } from './update-product.command';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
    private readonly brands: BrandRepository,
    private readonly mapper: ProductPersistenceMapper,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateProductCommand): Promise<ProductDetailDto> {
    const product = await this.products.findById(
      ProductId.restore(command.productId),
    );

    if (!product) {
      throw new ProductNotFoundException(command.productId);
    }

    const updateProps: {
      name?: ReturnType<typeof ProductName.create>;
      slug?: ReturnType<typeof Slug.create>;
      description?: ReturnType<typeof ProductDescription.create> | null;
      categoryId?: ReturnType<typeof CategoryId.restore>;
      brandId?: ReturnType<typeof BrandId.restore> | null;
    } = {};

    if (command.name !== undefined) {
      updateProps.name = ProductName.create(command.name);
    }

    if (command.slug !== undefined) {
      const slug = Slug.create(command.slug);
      if (!product.slug.equals(slug)) {
        const existing = await this.products.findBySlug(slug);
        if (existing && !existing.id.equals(product.id)) {
          throw new DuplicateSlugException(slug.value);
        }
      }
      updateProps.slug = slug;
    }

    if (command.clearDescription) {
      updateProps.description = null;
    } else if (command.description !== undefined) {
      updateProps.description = ProductDescription.create(command.description);
    }

    if (command.categoryId !== undefined) {
      const category = await this.categories.findById(
        CategoryId.restore(command.categoryId),
      );
      if (!category) {
        throw new CategoryNotFoundException(command.categoryId);
      }
      updateProps.categoryId = category.id;
    }

    if (command.clearBrand) {
      updateProps.brandId = null;
    } else if (command.brandId !== undefined) {
      const brand = await this.brands.findById(
        BrandId.restore(command.brandId),
      );
      if (!brand) {
        throw new BrandNotFoundException(command.brandId);
      }
      updateProps.brandId = brand.id;
    }

    product.updateDetails(updateProps);

    await this.products.save(product);

    const payload: ProductUpdatedEvent = {
      productId: product.id.value,
      occurredAt: new Date().toISOString(),
    };
    await this.eventPublisher.publish(EVENT_NAMES.PRODUCT_UPDATED, payload);

    return this.mapper.toDetailDtoFromDomain(product);
  }
}
