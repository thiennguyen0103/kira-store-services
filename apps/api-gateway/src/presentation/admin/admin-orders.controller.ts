import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { UserRole } from 'libs/shared/enums/user-role.enum';
import type {
  ListOrdersResponse,
  OrderResponse,
} from 'libs/shared/generated/orders';
import { OrdersClientPort } from '../../application/ports/orders-client.port';
import { Roles } from '../decorators/roles.decorator';
import { CancelOrderDto } from '../dto/orders/cancel-order.dto';
import { AdminListOrdersQueryDto } from '../dto/orders/list-orders-query.dto';
import {
  ListOrdersResponseDto,
  OrderResponseDto,
} from '../dto/orders/order-response.dto';
import { callGrpc } from '../helpers/call-grpc.helper';

@ApiTags('admin-orders')
@ApiBearerAuth('access-token')
@Roles(UserRole.ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersClient: OrdersClientPort) {}

  @Get()
  @ApiOperation({ summary: 'List all orders (admin)' })
  @ApiOkResponse({
    type: ListOrdersResponseDto,
    description: 'Paged list of orders',
  })
  list(@Query() query: AdminListOrdersQueryDto): Promise<ListOrdersResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.adminListOrders({
          status: query.status ?? '',
          customerId: query.customerId ?? '',
          page: query.page ?? 1,
          limit: query.limit ?? 20,
        }),
      ),
    );
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (admin)' })
  @ApiParam({ name: 'id', description: 'Order id' })
  @ApiBody({ type: CancelOrderDto })
  @ApiOkResponse({ type: OrderResponseDto, description: 'Cancelled order' })
  cancel(
    @Param('id') id: string,
    @Body() body: CancelOrderDto,
  ): Promise<OrderResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.adminCancelOrder({
          orderId: id,
          reason: body.reason ?? '',
        }),
      ),
    );
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund an order (admin)' })
  @ApiParam({ name: 'id', description: 'Order id' })
  @ApiBody({ type: CancelOrderDto })
  @ApiOkResponse({ type: OrderResponseDto, description: 'Refunded order' })
  refund(
    @Param('id') id: string,
    @Body() body: CancelOrderDto,
  ): Promise<OrderResponse> {
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.adminRefundOrder({
          orderId: id,
          reason: body.reason ?? '',
        }),
      ),
    );
  }
}
