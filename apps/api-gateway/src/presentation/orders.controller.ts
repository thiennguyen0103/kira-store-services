import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import type {
  CheckoutResponse,
  ListOrdersResponse,
  OrderResponse,
} from 'libs/shared/generated/orders';
import type { UserDetailResponse } from 'libs/shared/generated/users';
import { OrdersClientPort } from '../application/ports/orders-client.port';
import { UsersClientPort } from '../application/ports/users-client.port';
import { CurrentUser } from './decorators/current-user.decorator';
import { CancelOrderDto } from './dto/orders/cancel-order.dto';
import { CheckoutDto } from './dto/orders/checkout.dto';
import { ListOrdersQueryDto } from './dto/orders/list-orders-query.dto';
import type { AuthenticatedUser } from './guards/auth.guard';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller()
export class OrdersController {
  constructor(
    private readonly ordersClient: OrdersClientPort,
    private readonly usersClient: UsersClientPort,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout the cart and create an order' })
  @ApiBody({ type: CheckoutDto })
  @ApiOkResponse({ description: 'Checkout result with payment details' })
  async checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CheckoutDto,
  ): Promise<CheckoutResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.checkout({
          customerId,
          addressId: body.addressId,
          paymentProvider: body.paymentProvider,
        }),
      ),
    );
  }

  @Get('orders')
  @ApiOperation({ summary: 'List orders for the authenticated customer' })
  @ApiOkResponse({ description: 'Paged list of orders' })
  async listOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListOrdersQueryDto,
  ): Promise<ListOrdersResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.listOrders({
          customerId,
          page: query.page ?? 1,
          limit: query.limit ?? 20,
        }),
      ),
    );
  }

  @Get('orders/:id')
  @ApiOperation({
    summary: 'Get an order by id for the authenticated customer',
  })
  @ApiParam({ name: 'id', description: 'Order id' })
  @ApiOkResponse({ description: 'Order detail' })
  async getOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<OrderResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(this.ordersClient.getOrder({ orderId: id, customerId })),
    );
  }

  @Post('orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel an order for the authenticated customer' })
  @ApiParam({ name: 'id', description: 'Order id' })
  @ApiBody({ type: CancelOrderDto })
  @ApiOkResponse({ description: 'Cancelled order' })
  async cancelOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: CancelOrderDto,
  ): Promise<OrderResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.cancelOrder({
          orderId: id,
          customerId,
          reason: body.reason ?? '',
        }),
      ),
    );
  }

  private async resolveCustomerId(identityId: string): Promise<string> {
    const profile = await this.resolveCurrentUser(identityId);
    return profile.id;
  }

  private async resolveCurrentUser(
    identityId: string,
  ): Promise<UserDetailResponse> {
    const result = await callGrpc(() =>
      firstValueFrom(this.usersClient.getUserByIdentityId({ identityId })),
    );
    if (!result.user) {
      throw new NotFoundException('User profile not found for this account');
    }
    return result.user;
  }
}
