import { Logger } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelOrderCommand } from 'apps/orders-service/src/application/commands/cancel-order/cancel-order.command';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderStatus } from 'libs/shared/enums';
import { HandleStockReservationFailedCommand } from './handle-stock-reservation-failed.command';

@CommandHandler(HandleStockReservationFailedCommand)
export class StockReservationFailedHandler implements ICommandHandler<HandleStockReservationFailedCommand> {
  private readonly logger = new Logger(StockReservationFailedHandler.name);

  constructor(
    private readonly orders: OrderRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: HandleStockReservationFailedCommand): Promise<void> {
    if (!command.orderId) {
      this.logger.warn(
        `Stock reservation failed without orderId product=${command.productId} variant=${command.variantId}`,
      );
      return;
    }

    const order = await this.orders.findById(OrderId.restore(command.orderId));
    if (!order) {
      this.logger.warn(
        `Stock reservation failed for unknown order ${command.orderId}`,
      );
      return;
    }

    if (order.status.value === OrderStatus.CANCELLED) {
      this.logger.debug(
        `Order ${command.orderId} already cancelled; ignoring stock_reservation_failed`,
      );
      return;
    }

    if (order.status.value !== OrderStatus.AWAITING_STOCK) {
      this.logger.debug(
        `Ignoring stock_reservation_failed for order ${command.orderId} in status ${order.status.value}`,
      );
      return;
    }

    await this.commandBus.execute(
      new CancelOrderCommand(
        command.orderId,
        undefined,
        `Stock reservation failed for ${command.productId}/${command.variantId}`,
      ),
    );
    this.logger.log(
      `Cancelled order ${command.orderId} after stock reservation failure`,
    );
  }
}
