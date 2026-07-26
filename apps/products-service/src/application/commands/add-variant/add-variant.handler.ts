import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductDetailDto } from 'apps/products-service/src/application/dto/product.dto';
import { ProductVariant } from 'apps/products-service/src/domain/entities/product-variant.entity';
import { CurrencyCode } from 'apps/products-service/src/domain/enums/currency-code.enum';
import { ProductNotFoundException } from 'apps/products-service/src/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { Sku } from 'apps/products-service/src/domain/value-objects/product/sku.vo';
import { VariantId } from 'apps/products-service/src/domain/value-objects/product/variant-id.vo';
import { VariantOptions } from 'apps/products-service/src/domain/value-objects/product/variant-options.vo';
import { Money } from 'apps/products-service/src/domain/value-objects/shared/money.vo';
import { StockLevel } from 'apps/products-service/src/domain/value-objects/shared/stock-level.vo';
import { ProductPersistenceMapper } from 'apps/products-service/src/infrastructure/persistence/mappers/product-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { ProductUpdatedEvent } from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import { AddVariantCommand } from './add-variant.command';

@CommandHandler(AddVariantCommand)
export class AddVariantHandler implements ICommandHandler<AddVariantCommand> {
  constructor(
    private readonly products: ProductRepository,
    private readonly mapper: ProductPersistenceMapper,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AddVariantCommand): Promise<ProductDetailDto> {
    const product = await this.products.findById(
      ProductId.restore(command.productId),
    );

    if (!product) {
      throw new ProductNotFoundException(command.productId);
    }

    const variant = ProductVariant.create(VariantId.create(), {
      sku: Sku.create(command.sku),
      options: VariantOptions.create(command.options ?? {}),
      price: Money.create(
        command.priceAmount,
        command.priceCurrency as CurrencyCode,
      ),
      stock: StockLevel.create(command.onHand ?? 0),
      barcode: command.barcode,
      isActive: command.isActive,
    });

    product.addVariant(variant);

    await this.products.save(product);

    const payload: ProductUpdatedEvent = {
      productId: product.id.value,
      occurredAt: new Date().toISOString(),
    };
    await this.eventPublisher.publish(EVENT_NAMES.PRODUCT_UPDATED, payload);

    return this.mapper.toDetailDtoFromDomain(product);
  }
}
