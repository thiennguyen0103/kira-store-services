import { Logger } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmOrderCommand } from 'apps/orders-service/src/application/commands/confirm-order/confirm-order.command';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderStatus } from 'libs/shared/enums';
import { HandlePaymentSucceededCommand } from './handle-payment-succeeded.command';

@CommandHandler(HandlePaymentSucceededCommand)
export class PaymentSucceededHandler implements ICommandHandler<HandlePaymentSucceededCommand> {
  private readonly logger = new Logger(PaymentSucceededHandler.name);

  constructor(
    private readonly orders: OrderRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: HandlePaymentSucceededCommand): Promise<void> {
    const order = await this.orders.findById(OrderId.restore(command.orderId));
    if (!order) {
      this.logger.warn(
        `Payment succeeded for unknown order ${command.orderId}`,
      );
      return;
    }

    if (
      order.status.value === OrderStatus.PAID ||
      order.status.value === OrderStatus.CONFIRMED
    ) {
      this.logger.debug(
        `Order ${command.orderId} already ${order.status.value}; ignoring payment.succeeded`,
      );
      return;
    }

    if (order.status.value !== OrderStatus.PAYMENT_PENDING) {
      this.logger.warn(
        `Ignoring payment.succeeded for order ${command.orderId} in status ${order.status.value}`,
      );
      return;
    }

    await this.commandBus.execute(new ConfirmOrderCommand(command.orderId));
    this.logger.log(
      `Confirmed order ${command.orderId} after payment ${command.paymentId}`,
    );
  }
}
