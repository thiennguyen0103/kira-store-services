import { Logger } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelOrderCommand } from 'apps/orders-service/src/application/commands/cancel-order/cancel-order.command';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderStatus } from 'libs/shared/enums';
import { HandlePaymentFailedCommand } from './handle-payment-failed.command';

@CommandHandler(HandlePaymentFailedCommand)
export class PaymentFailedHandler implements ICommandHandler<HandlePaymentFailedCommand> {
  private readonly logger = new Logger(PaymentFailedHandler.name);

  constructor(
    private readonly orders: OrderRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: HandlePaymentFailedCommand): Promise<void> {
    const order = await this.orders.findById(OrderId.restore(command.orderId));
    if (!order) {
      this.logger.warn(`Payment failed for unknown order ${command.orderId}`);
      return;
    }

    if (
      order.status.value === OrderStatus.CANCELLED ||
      order.status.value === OrderStatus.REFUNDED
    ) {
      this.logger.debug(
        `Order ${command.orderId} already ${order.status.value}; ignoring payment.failed`,
      );
      return;
    }

    if (
      order.status.value !== OrderStatus.PAYMENT_PENDING &&
      order.status.value !== OrderStatus.AWAITING_STOCK &&
      order.status.value !== OrderStatus.PENDING
    ) {
      this.logger.warn(
        `Ignoring payment.failed for order ${command.orderId} in status ${order.status.value}`,
      );
      return;
    }

    await this.commandBus.execute(
      new CancelOrderCommand(
        command.orderId,
        undefined,
        command.reason || 'Payment failed',
      ),
    );
    this.logger.log(
      `Cancelled order ${command.orderId} after payment failure ${command.paymentId}`,
    );
  }
}
