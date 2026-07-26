import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductDetailDto } from 'apps/products-service/src/application/dto/product.dto';
import { ProductNotFoundException } from 'apps/products-service/src/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { ProductPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/product-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { ProductUpdatedEvent } from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import { ArchiveProductCommand } from './archive-product.command';

@CommandHandler(ArchiveProductCommand)
export class ArchiveProductHandler implements ICommandHandler<ArchiveProductCommand> {
  constructor(
    private readonly products: ProductRepository,
    private readonly mapper: ProductPersistenceMapper,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ArchiveProductCommand): Promise<ProductDetailDto> {
    const product = await this.products.findById(
      ProductId.restore(command.productId),
    );

    if (!product) {
      throw new ProductNotFoundException(command.productId);
    }

    product.archive();

    await this.products.save(product);

    const payload: ProductUpdatedEvent = {
      productId: product.id.value,
      occurredAt: new Date().toISOString(),
    };
    await this.eventPublisher.publish(EVENT_NAMES.PRODUCT_UPDATED, payload);

    return this.mapper.toDetailDtoFromDomain(product);
  }
}
