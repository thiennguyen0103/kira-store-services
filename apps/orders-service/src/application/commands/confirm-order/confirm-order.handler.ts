import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { OrderDetailDto } from 'apps/orders-service/src/application/dto/order.dto';
import { OrderEventsPublisherPort } from 'apps/orders-service/src/application/ports/order-events-publisher.port';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { OrderNotFoundException } from 'apps/orders-service/src/domain/exceptions/order-not-found.exception';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import { OrderStatus } from 'libs/shared/enums';
import type { OrderConfirmedEvent } from 'libs/shared/events';
import { ConfirmOrderCommand } from './confirm-order.command';

@CommandHandler(ConfirmOrderCommand)
export class ConfirmOrderHandler implements ICommandHandler<ConfirmOrderCommand> {
  private readonly logger = new Logger(ConfirmOrderHandler.name);

  constructor(
    private readonly orders: OrderRepositoryPort,
    private readonly mapper: OrderPersistenceMapper,
    private readonly events: OrderEventsPublisherPort,
  ) {}

  async execute(command: ConfirmOrderCommand): Promise<OrderDetailDto> {
    const order = await this.orders.findById(OrderId.restore(command.orderId));
    if (!order) {
      throw new OrderNotFoundException(command.orderId);
    }

    if (order.status.value === OrderStatus.CONFIRMED) {
      this.logger.debug(`Order ${order.id.value} already confirmed`);
      return this.mapper.toOrderDetailDto(order);
    }

    if (order.status.value === OrderStatus.PAYMENT_PENDING) {
      order.markPaid();
    }

    order.confirm();
    await this.orders.save(order);

    const payload: OrderConfirmedEvent = {
      orderId: order.id.value,
      occurredAt: new Date().toISOString(),
    };
    await this.events.publish(EVENT_NAMES.ORDER_CONFIRMED, payload);

    this.logger.log(`Confirmed order ${order.id.value}`);
    return this.mapper.toOrderDetailDto(order);
  }
}
