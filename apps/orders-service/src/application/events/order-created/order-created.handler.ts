import { Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderCreatedEvent } from 'apps/orders-service/src/domain/events/order-created.event';

@EventsHandler(OrderCreatedEvent)
export class OrderCreatedHandler implements IEventHandler<OrderCreatedEvent> {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  handle(event: OrderCreatedEvent): void {
    this.logger.debug(`Domain OrderCreatedEvent ${event.orderId.value}`);
  }
}
