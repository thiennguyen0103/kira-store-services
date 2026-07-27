import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CancelOrderCommand } from 'apps/orders-service/src/application/commands/cancel-order/cancel-order.command';
import type {
  OrderDetailDto,
  OrderSummaryDto,
} from 'apps/orders-service/src/application/dto/order.dto';
import { GetOrderQuery } from 'apps/orders-service/src/application/queries/get-order/get-order.query';
import { ListOrdersQuery } from 'apps/orders-service/src/application/queries/list-orders/list-orders.query';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'List orders' })
  async list(@Query() query: ListOrdersDto) {
    return this.queryBus.execute<
      ListOrdersQuery,
      PagedResultDto<OrderSummaryDto>
    >(
      new ListOrdersQuery(
        query.page ?? 1,
        query.limit ?? 20,
        query.customerId,
        query.status,
      ),
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: OrderResponseDto })
  async get(@Param('id') id: string): Promise<OrderDetailDto> {
    return this.queryBus.execute(new GetOrderQuery(id));
  }

  @Post(':id/cancel')
  @ApiOkResponse({ type: OrderResponseDto })
  async cancel(
    @Param('id') id: string,
    @Body() body: CancelOrderDto,
  ): Promise<OrderDetailDto> {
    return this.commandBus.execute(
      new CancelOrderCommand(id, undefined, body.reason),
    );
  }
}
