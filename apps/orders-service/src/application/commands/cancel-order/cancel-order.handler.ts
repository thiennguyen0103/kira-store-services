import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { OrderDetailDto } from 'apps/orders-service/src/application/dto/order.dto';
import { OrderEventsPublisherPort } from 'apps/orders-service/src/application/ports/order-events-publisher.port';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { OrderNotFoundException } from 'apps/orders-service/src/domain/exceptions/order-not-found.exception';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import { OrderStatus } from 'libs/shared/enums';
import type { OrderCancelledEvent } from 'libs/shared/events';
import { CancelOrderCommand } from './cancel-order.command';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  private readonly logger = new Logger(CancelOrderHandler.name);

  constructor(
    private readonly orders: OrderRepositoryPort,
    private readonly mapper: OrderPersistenceMapper,
    private readonly events: OrderEventsPublisherPort,
  ) {}

  async execute(command: CancelOrderCommand): Promise<OrderDetailDto> {
    const orderId = OrderId.restore(command.orderId);
    const order = command.customerId
      ? await this.orders.findByIdForCustomer(
          orderId,
          CustomerId.restore(command.customerId),
        )
      : await this.orders.findById(orderId);

    if (!order) {
      throw new OrderNotFoundException(command.orderId);
    }

    if (order.status.value === OrderStatus.CANCELLED) {
      this.logger.debug(`Order ${order.id.value} already cancelled`);
      return this.mapper.toOrderDetailDto(order);
    }

    order.cancel(command.reason);
    await this.orders.save(order);

    const payload: OrderCancelledEvent = {
      orderId: order.id.value,
      items: order.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      occurredAt: new Date().toISOString(),
    };
    await this.events.publish(EVENT_NAMES.ORDER_CANCELLED, payload);

    this.logger.log(`Cancelled order ${order.id.value}`);
    return this.mapper.toOrderDetailDto(order);
  }
}
