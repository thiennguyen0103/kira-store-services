import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InsufficientStockException } from 'apps/products-service/src/domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from 'apps/products-service/src/domain/exceptions/product-not-found.exception';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { VariantId } from 'apps/products-service/src/domain/value-objects/product/variant-id.vo';
import { EVENT_NAMES } from 'libs/shared/constants';
import type {
  StockReservationFailedEvent,
  StockReservedEvent,
} from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import {
  ReserveStockCommand,
  StockItemInput,
  StockMutationResult,
} from './reserve-stock.command';

@CommandHandler(ReserveStockCommand)
export class ReserveStockHandler implements ICommandHandler<ReserveStockCommand> {
  constructor(
    private readonly products: ProductRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ReserveStockCommand): Promise<StockMutationResult> {
    const reserved: StockItemInput[] = [];

    try {
      for (const item of command.items) {
        const product = await this.products.findById(
          ProductId.restore(item.productId),
        );
        if (!product) {
          throw new ProductNotFoundException(item.productId);
        }

        product.reserveStock(VariantId.restore(item.variantId), item.quantity);
        await this.products.save(product);
        reserved.push(item);

        const event: StockReservedEvent = {
          orderId: command.orderId,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          occurredAt: new Date().toISOString(),
        };
        await this.eventPublisher.publish(EVENT_NAMES.STOCK_RESERVED, event);
      }

      return new StockMutationResult(
        command.orderId,
        true,
        'Stock reserved successfully',
      );
    } catch (error) {
      for (const item of [...reserved].reverse()) {
        const product = await this.products.findById(
          ProductId.restore(item.productId),
        );
        if (product) {
          product.releaseStock(
            VariantId.restore(item.variantId),
            item.quantity,
          );
          await this.products.save(product);
        }
      }

      if (error instanceof InsufficientStockException) {
        const failedItem = command.items[reserved.length];
        const available =
          typeof error.details?.available === 'number'
            ? error.details.available
            : 0;

        const failed: StockReservationFailedEvent = {
          orderId: command.orderId,
          productId: failedItem?.productId ?? '',
          variantId: failedItem?.variantId ?? '',
          quantity: failedItem?.quantity ?? 0,
          available,
          occurredAt: new Date().toISOString(),
        };
        await this.eventPublisher.publish(
          EVENT_NAMES.STOCK_RESERVATION_FAILED,
          failed,
        );

        return new StockMutationResult(command.orderId, false, error.message);
      }

      throw error;
    }
  }
}
