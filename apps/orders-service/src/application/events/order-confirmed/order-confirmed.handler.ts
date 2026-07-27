import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderConfirmedEvent } from 'apps/orders-service/src/domain/events/order-confirmed.event';

@EventsHandler(OrderConfirmedEvent)
export class OrderConfirmedHandler implements IEventHandler<OrderConfirmedEvent> {
  private readonly logger = new Logger(OrderConfirmedHandler.name);

  handle(event: OrderConfirmedEvent): void {
    this.logger.debug(`Domain OrderConfirmedEvent ${event.orderId.value}`);
  }
}
