import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductDetailDto } from 'apps/products-service/src/application/dto/product.dto';
import { CurrencyCode } from 'apps/products-service/src/domain/enums/currency-code.enum';
import { ProductNotFoundException } from 'apps/products-service/src/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { VariantId } from 'apps/products-service/src/domain/value-objects/product/variant-id.vo';
import { VariantOptions } from 'apps/products-service/src/domain/value-objects/product/variant-options.vo';
import { Money } from 'apps/products-service/src/domain/value-objects/shared/money.vo';
import { ProductPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/product-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { ProductUpdatedEvent } from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import { UpdateVariantCommand } from './update-variant.command';

@CommandHandler(UpdateVariantCommand)
export class UpdateVariantHandler implements ICommandHandler<UpdateVariantCommand> {
  constructor(
    private readonly products: ProductRepository,
    private readonly mapper: ProductPersistenceMapper,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: UpdateVariantCommand): Promise<ProductDetailDto> {
    const product = await this.products.findById(
      ProductId.restore(command.productId),
    );

    if (!product) {
      throw new ProductNotFoundException(command.productId);
    }

    const updateProps: {
      options?: ReturnType<typeof VariantOptions.create>;
      price?: ReturnType<typeof Money.create>;
      barcode?: string | null;
      isActive?: boolean;
    } = {};

    if (command.options !== undefined) {
      updateProps.options = VariantOptions.create(command.options);
    }

    if (
      command.priceAmount !== undefined &&
      command.priceCurrency !== undefined
    ) {
      updateProps.price = Money.create(
        command.priceAmount,
        command.priceCurrency as CurrencyCode,
      );
    }

    if (command.clearBarcode) {
      updateProps.barcode = null;
    } else if (command.barcode !== undefined) {
      updateProps.barcode = command.barcode;
    }

    if (command.isActive !== undefined) {
      updateProps.isActive = command.isActive;
    }

    product.updateVariant(VariantId.restore(command.variantId), updateProps);

    await this.products.save(product);

    const payload: ProductUpdatedEvent = {
      productId: product.id.value,
      occurredAt: new Date().toISOString(),
    };
    await this.eventPublisher.publish(EVENT_NAMES.PRODUCT_UPDATED, payload);

    return this.mapper.toDetailDtoFromDomain(product);
  }
}
