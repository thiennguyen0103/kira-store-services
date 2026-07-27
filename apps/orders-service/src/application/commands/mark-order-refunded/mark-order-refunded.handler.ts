import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { OrderNotFoundException } from 'apps/orders-service/src/domain/exceptions/order-not-found.exception';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderStatus } from 'libs/shared/enums';
import { MarkOrderRefundedCommand } from './mark-order-refunded.command';

@CommandHandler(MarkOrderRefundedCommand)
export class MarkOrderRefundedHandler implements ICommandHandler<MarkOrderRefundedCommand> {
  private readonly logger = new Logger(MarkOrderRefundedHandler.name);

  constructor(private readonly orders: OrderRepositoryPort) {}

  async execute(command: MarkOrderRefundedCommand): Promise<void> {
    const order = await this.orders.findById(OrderId.restore(command.orderId));
    if (!order) {
      throw new OrderNotFoundException(command.orderId);
    }

    if (order.status.value === OrderStatus.REFUNDED) {
      this.logger.debug(`Order ${command.orderId} already refunded`);
      return;
    }

    if (order.status.value === OrderStatus.CANCELLED) {
      this.logger.debug(
        `Ignoring refunded payment for cancelled order ${command.orderId}`,
      );
      return;
    }

    if (
      order.status.value === OrderStatus.PAID ||
      order.status.value === OrderStatus.CONFIRMED
    ) {
      order.startRefund();
    }

    if (order.status.value !== OrderStatus.REFUNDING) {
      this.logger.warn(
        `Cannot mark order ${command.orderId} refunded from status ${order.status.value}`,
      );
      return;
    }

    order.markRefunded();
    await this.orders.save(order);
    this.logger.log(
      `Marked order ${command.orderId} refunded (payment=${command.paymentId})`,
    );
  }
}
