import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderCancelledEvent } from 'apps/orders-service/src/domain/events/order-cancelled.event';

@EventsHandler(OrderCancelledEvent)
export class OrderCancelledHandler implements IEventHandler<OrderCancelledEvent> {
  private readonly logger = new Logger(OrderCancelledHandler.name);

  handle(event: OrderCancelledEvent): void {
    this.logger.debug(
      `Domain OrderCancelledEvent ${event.orderId.value} reason=${event.reason ?? 'n/a'}`,
    );
  }
}
