import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
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
import type { CartResponse } from 'libs/shared/generated/orders';
import type { UserDetailResponse } from 'libs/shared/generated/users';
import { OrdersClientPort } from '../application/ports/orders-client.port';
import { UsersClientPort } from '../application/ports/users-client.port';
import { CurrentUser } from './decorators/current-user.decorator';
import { AddCartItemDto } from './dto/orders/add-cart-item.dto';
import { CartResponseDto } from './dto/orders/order-response.dto';
import { UpdateCartItemDto } from './dto/orders/update-cart-item.dto';
import type { AuthenticatedUser } from './guards/auth.guard';
import { callGrpc } from './helpers/call-grpc.helper';

@ApiTags('cart')
@ApiBearerAuth('access-token')
@Controller('cart')
export class CartController {
  constructor(
    private readonly ordersClient: OrdersClientPort,
    private readonly usersClient: UsersClientPort,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated customer cart' })
  @ApiOkResponse({ type: CartResponseDto, description: 'Current cart' })
  async getCart(@CurrentUser() user: AuthenticatedUser): Promise<CartResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(this.ordersClient.getCart({ customerId })),
    );
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiBody({ type: AddCartItemDto })
  @ApiOkResponse({ type: CartResponseDto, description: 'Updated cart' })
  async addItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AddCartItemDto,
  ): Promise<CartResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.addCartItem({
          customerId,
          productId: body.productId,
          variantId: body.variantId,
          quantity: body.quantity,
        }),
      ),
    );
  }

  @Patch('items')
  @ApiOperation({ summary: 'Update a cart item quantity' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiOkResponse({ type: CartResponseDto, description: 'Updated cart' })
  async updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateCartItemDto,
  ): Promise<CartResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.updateCartItem({
          customerId,
          productId: body.productId,
          variantId: body.variantId,
          quantity: body.quantity,
        }),
      ),
    );
  }

  @Delete('items/:productId/:variantId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({ name: 'productId', description: 'Product id' })
  @ApiParam({ name: 'variantId', description: 'Variant id' })
  @ApiOkResponse({ type: CartResponseDto, description: 'Updated cart' })
  async removeItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ): Promise<CartResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(
        this.ordersClient.removeCartItem({
          customerId,
          productId,
          variantId,
        }),
      ),
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the authenticated customer cart' })
  @ApiOkResponse({ type: CartResponseDto, description: 'Empty cart' })
  async clearCart(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CartResponse> {
    const customerId = await this.resolveCustomerId(user.identityId);
    return callGrpc(() =>
      firstValueFrom(this.ordersClient.clearCart({ customerId })),
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
