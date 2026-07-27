import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HandleStockReservationCompletedCommand } from 'apps/orders-service/src/application/external-events/handle-stock-reservation-completed.command';
import { HandleStockReservationFailedCommand } from 'apps/orders-service/src/application/external-events/handle-stock-reservation-failed.command';
import { EVENT_NAMES } from 'libs/shared/constants';
import type {
  StockReservationCompletedEvent,
  StockReservationFailedEvent,
} from 'libs/shared/events';

@Controller()
export class ProductEventsSubscriber {
  private readonly logger = new Logger(ProductEventsSubscriber.name);

  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern(EVENT_NAMES.STOCK_RESERVATION_COMPLETED)
  async onStockReservationCompleted(
    @Payload() event: StockReservationCompletedEvent,
  ): Promise<void> {
    if (!event?.orderId || !Array.isArray(event.items)) {
      this.logger.warn('Ignoring malformed stock_reservation_completed event');
      return;
    }

    await this.commandBus.execute(
      new HandleStockReservationCompletedCommand(event.orderId, event.items),
    );
  }

  @EventPattern(EVENT_NAMES.STOCK_RESERVATION_FAILED)
  async onStockReservationFailed(
    @Payload() event: StockReservationFailedEvent,
  ): Promise<void> {
    if (!event?.productId || !event?.variantId) {
      this.logger.warn('Ignoring malformed stock_reservation_failed event');
      return;
    }

    await this.commandBus.execute(
      new HandleStockReservationFailedCommand(
        event.orderId,
        event.productId,
        event.variantId,
        event.quantity,
        event.available,
      ),
    );
  }
}
