import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductDetailDto } from 'apps/products-service/src/application/dto/product.dto';
import { ProductImage } from 'apps/products-service/src/domain/entities/product-image.entity';
import { ProductNotFoundException } from 'apps/products-service/src/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { ImageId } from 'apps/products-service/src/domain/value-objects/product/image-id.vo';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { ImageUrl } from 'apps/products-service/src/domain/value-objects/shared/image-url.vo';
import { ProductPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/product-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { ProductUpdatedEvent } from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import {
  SetProductImageInput,
  SetProductImagesCommand,
} from './set-product-images.command';

@CommandHandler(SetProductImagesCommand)
export class SetProductImagesHandler implements ICommandHandler<SetProductImagesCommand> {
  constructor(
    private readonly products: ProductRepository,
    private readonly mapper: ProductPersistenceMapper,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: SetProductImagesCommand): Promise<ProductDetailDto> {
    const product = await this.products.findById(
      ProductId.restore(command.productId),
    );

    if (!product) {
      throw new ProductNotFoundException(command.productId);
    }

    const images = command.images.map((input) => this.toImage(input));
    product.setImages(images);

    await this.products.save(product);

    const payload: ProductUpdatedEvent = {
      productId: product.id.value,
      occurredAt: new Date().toISOString(),
    };
    await this.eventPublisher.publish(EVENT_NAMES.PRODUCT_UPDATED, payload);

    return this.mapper.toDetailDtoFromDomain(product);
  }

  private toImage(input: SetProductImageInput): ProductImage {
    return ProductImage.create(ImageId.create(), {
      url: ImageUrl.create(input.url),
      alt: input.alt,
      sortOrder: input.sortOrder,
      isPrimary: input.isPrimary,
    });
  }
}
