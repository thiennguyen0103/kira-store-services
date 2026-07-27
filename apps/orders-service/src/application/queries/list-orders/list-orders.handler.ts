import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { OrderSummaryDto } from 'apps/orders-service/src/application/dto/order.dto';
import { OrderReadModelPort } from 'apps/orders-service/src/application/ports/order-read-model.port';
import { PageRequestDto } from 'libs/shared/dto/page-request.dto';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { ListOrdersQuery } from './list-orders.query';

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<ListOrdersQuery> {
  constructor(private readonly orders: OrderReadModelPort) {}

  async execute(
    query: ListOrdersQuery,
  ): Promise<PagedResultDto<OrderSummaryDto>> {
    return this.orders.list(new PageRequestDto(query.page, query.limit), {
      customerId: query.customerId,
      status: query.status,
    });
  }
}
