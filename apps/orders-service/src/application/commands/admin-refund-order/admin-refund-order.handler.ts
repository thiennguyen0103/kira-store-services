import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { OrderDetailDto } from 'apps/orders-service/src/application/dto/order.dto';
import { PaymentsClientPort } from 'apps/orders-service/src/application/ports/payments-client.port';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { OrderNotFoundException } from 'apps/orders-service/src/domain/exceptions/order-not-found.exception';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { AdminRefundOrderCommand } from './admin-refund-order.command';

@CommandHandler(AdminRefundOrderCommand)
export class AdminRefundOrderHandler implements ICommandHandler<AdminRefundOrderCommand> {
  private readonly logger = new Logger(AdminRefundOrderHandler.name);

  constructor(
    private readonly orders: OrderRepositoryPort,
    private readonly payments: PaymentsClientPort,
    private readonly mapper: OrderPersistenceMapper,
  ) {}

  async execute(command: AdminRefundOrderCommand): Promise<OrderDetailDto> {
    const order = await this.orders.findById(OrderId.restore(command.orderId));
    if (!order) {
      throw new OrderNotFoundException(command.orderId);
    }

    order.startRefund();
    await this.orders.save(order);

    await this.payments.refundPayment({
      paymentId: order.paymentId,
      orderId: order.id.value,
      reason: command.reason ?? 'admin.refund',
    });

    order.markRefunded();
    await this.orders.save(order);

    this.logger.log(`Refunded order ${order.id.value}`);
    return this.mapper.toOrderDetailDto(order);
  }
}
