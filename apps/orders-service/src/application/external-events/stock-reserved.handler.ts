import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderStatus } from 'libs/shared/enums';
import { HandleStockReservationCompletedCommand } from './handle-stock-reservation-completed.command';

/**
 * Async safety net. Sync checkout already moves to PAYMENT_PENDING after gRPC reserve.
 */
@CommandHandler(HandleStockReservationCompletedCommand)
export class StockReservedHandler implements ICommandHandler<HandleStockReservationCompletedCommand> {
  private readonly logger = new Logger(StockReservedHandler.name);

  constructor(private readonly orders: OrderRepositoryPort) {}

  async execute(
    command: HandleStockReservationCompletedCommand,
  ): Promise<void> {
    const order = await this.orders.findById(OrderId.restore(command.orderId));
    if (!order) {
      this.logger.warn(
        `Stock reservation completed for unknown order ${command.orderId}`,
      );
      return;
    }

    if (
      order.status.value === OrderStatus.PAYMENT_PENDING ||
      order.status.value === OrderStatus.PAID ||
      order.status.value === OrderStatus.CONFIRMED
    ) {
      this.logger.debug(
        `Order ${command.orderId} already past awaiting stock (${order.status.value}); no-op`,
      );
      return;
    }

    this.logger.warn(
      `Received stock_reservation_completed for order ${command.orderId} in status ${order.status.value}; sync checkout expected PAYMENT_PENDING`,
    );
  }
}
