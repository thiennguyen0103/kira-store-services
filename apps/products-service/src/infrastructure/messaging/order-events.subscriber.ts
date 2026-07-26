import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ReserveStockCommand,
  StockMutationResult,
} from 'apps/products-service/src/application/commands/reserve-stock/reserve-stock.command';
import { ReleaseStockCommand } from 'apps/products-service/src/application/commands/release-stock/release-stock.command';
import { EVENT_NAMES } from 'libs/shared/constants';
import type {
  OrderCancelledEvent,
  OrderCreatedEvent,
} from 'libs/shared/events';

@Controller()
export class OrderEventsSubscriber {
  private readonly logger = new Logger(OrderEventsSubscriber.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(EVENT_NAMES.ORDER_CREATED)
  async onOrderCreated(@Payload() event: OrderCreatedEvent): Promise<void> {
    if (
      !event?.orderId ||
      !Array.isArray(event.items) ||
      event.items.length === 0
    ) {
      this.logger.warn('Ignoring malformed order.created event');
      return;
    }

    const result = await this.commandBus.execute<
      ReserveStockCommand,
      StockMutationResult
    >(new ReserveStockCommand(event.orderId, event.items));

    this.logger.log(
      `Processed order.created ${event.orderId}: success=${result.success}`,
    );
  }

  @EventPattern(EVENT_NAMES.ORDER_CANCELLED)
  async onOrderCancelled(@Payload() event: OrderCancelledEvent): Promise<void> {
    if (
      !event?.orderId ||
      !Array.isArray(event.items) ||
      event.items.length === 0
    ) {
      this.logger.warn('Ignoring malformed order.cancelled event');
      return;
    }

    await this.commandBus.execute(
      new ReleaseStockCommand(event.orderId, event.items),
    );

    this.logger.log(`Processed order.cancelled ${event.orderId}`);
  }
}
