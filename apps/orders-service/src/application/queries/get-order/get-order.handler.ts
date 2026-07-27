import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { OrderDetailDto } from 'apps/orders-service/src/application/dto/order.dto';
import { OrderReadModelPort } from 'apps/orders-service/src/application/ports/order-read-model.port';
import { OrderNotFoundException } from 'apps/orders-service/src/domain/exceptions/order-not-found.exception';
import { GetOrderQuery } from './get-order.query';

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(private readonly orders: OrderReadModelPort) {}

  async execute(query: GetOrderQuery): Promise<OrderDetailDto> {
    const order = query.customerId
      ? await this.orders.findByIdForCustomer(query.orderId, query.customerId)
      : await this.orders.findById(query.orderId);

    if (!order) {
      throw new OrderNotFoundException(query.orderId);
    }
    return order;
  }
}
