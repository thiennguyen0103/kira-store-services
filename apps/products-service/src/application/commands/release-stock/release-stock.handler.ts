import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductNotFoundException } from 'apps/products-service/src/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { VariantId } from 'apps/products-service/src/domain/value-objects/product/variant-id.vo';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { StockReleasedEvent } from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import { StockMutationResult } from '../reserve-stock/reserve-stock.command';
import { ReleaseStockCommand } from './release-stock.command';

@CommandHandler(ReleaseStockCommand)
export class ReleaseStockHandler implements ICommandHandler<ReleaseStockCommand> {
  constructor(
    private readonly products: ProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ReleaseStockCommand): Promise<StockMutationResult> {
    for (const item of command.items) {
      const product = await this.products.findById(
        ProductId.restore(item.productId),
      );
      if (!product) {
        throw new ProductNotFoundException(item.productId);
      }

      product.releaseStock(VariantId.restore(item.variantId), item.quantity);
      await this.products.save(product);

      const event: StockReleasedEvent = {
        orderId: command.orderId,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        occurredAt: new Date().toISOString(),
      };
      await this.eventPublisher.publish(EVENT_NAMES.STOCK_RELEASED, event);
    }

    return new StockMutationResult(
      command.orderId,
      true,
      'Stock released successfully',
    );
  }
}
