import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { AddCartItemCommand } from 'apps/orders-service/src/application/commands/add-cart-item/add-cart-item.command';
import { AdminRefundOrderCommand } from 'apps/orders-service/src/application/commands/admin-refund-order/admin-refund-order.command';
import { CancelOrderCommand } from 'apps/orders-service/src/application/commands/cancel-order/cancel-order.command';
import { ClearCartCommand } from 'apps/orders-service/src/application/commands/clear-cart/clear-cart.command';
import { CreateOrderCommand } from 'apps/orders-service/src/application/commands/create-order/create-order.command';
import { RemoveCartItemCommand } from 'apps/orders-service/src/application/commands/remove-cart-item/remove-cart-item.command';
import { UpdateCartItemCommand } from 'apps/orders-service/src/application/commands/update-cart-item/update-cart-item.command';
import type { CartDto } from 'apps/orders-service/src/application/dto/cart.dto';
import type {
  OrderDetailDto,
  OrderSummaryDto,
} from 'apps/orders-service/src/application/dto/order.dto';
import { GetCartQuery } from 'apps/orders-service/src/application/queries/get-cart/get-cart.query';
import { GetOrderQuery } from 'apps/orders-service/src/application/queries/get-order/get-order.query';
import { ListOrdersQuery } from 'apps/orders-service/src/application/queries/list-orders/list-orders.query';
import { GRPC_SERVICE_NAMES } from 'libs/shared/constants';
import { PagedResultDto } from 'libs/shared/dto/paged-result.dto';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import type {
  AddCartItemRequest,
  AdminCancelOrderRequest,
  AdminListOrdersRequest,
  AdminRefundOrderRequest,
  CancelOrderRequest,
  CartResponse,
  CheckoutRequest,
  CheckoutResponse,
  ClearCartRequest,
  GetCartRequest,
  GetOrderRequest,
  ListOrdersRequest,
  ListOrdersResponse,
  OrderResponse,
  PingRequest,
  PingResponse,
  RemoveCartItemRequest,
  UpdateCartItemRequest,
} from 'libs/shared/generated/orders';

@Controller()
export class OrdersGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'Ping')
  ping(_data: PingRequest): PingResponse {
    return { ok: true, service: 'orders-service' };
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'GetCart')
  async getCart(request: GetCartRequest): Promise<CartResponse> {
    return this.execute(async () => {
      const cart = await this.queryBus.execute<GetCartQuery, CartDto>(
        new GetCartQuery(request.customerId),
      );
      return this.toCartResponse(cart);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'AddCartItem')
  async addCartItem(request: AddCartItemRequest): Promise<CartResponse> {
    return this.execute(async () => {
      const cart = await this.commandBus.execute<AddCartItemCommand, CartDto>(
        new AddCartItemCommand(
          request.customerId,
          request.productId,
          request.variantId,
          request.quantity,
        ),
      );
      return this.toCartResponse(cart);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'UpdateCartItem')
  async updateCartItem(request: UpdateCartItemRequest): Promise<CartResponse> {
    return this.execute(async () => {
      const cart = await this.commandBus.execute<
        UpdateCartItemCommand,
        CartDto
      >(
        new UpdateCartItemCommand(
          request.customerId,
          request.productId,
          request.variantId,
          request.quantity,
        ),
      );
      return this.toCartResponse(cart);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'RemoveCartItem')
  async removeCartItem(request: RemoveCartItemRequest): Promise<CartResponse> {
    return this.execute(async () => {
      const cart = await this.commandBus.execute<
        RemoveCartItemCommand,
        CartDto
      >(
        new RemoveCartItemCommand(
          request.customerId,
          request.productId,
          request.variantId,
        ),
      );
      return this.toCartResponse(cart);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'ClearCart')
  async clearCart(request: ClearCartRequest): Promise<CartResponse> {
    return this.execute(async () => {
      const cart = await this.commandBus.execute<ClearCartCommand, CartDto>(
        new ClearCartCommand(request.customerId),
      );
      return this.toCartResponse(cart);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'Checkout')
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    return this.execute(async () => {
      const order = await this.commandBus.execute<
        CreateOrderCommand,
        OrderDetailDto
      >(
        new CreateOrderCommand(
          request.customerId,
          request.addressId,
          request.paymentProvider,
        ),
      );
      return {
        order: this.toOrderResponse(order),
        paymentUrl: order.paymentUrl ?? '',
        paymentId: order.paymentId ?? '',
      };
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'GetOrder')
  async getOrder(request: GetOrderRequest): Promise<OrderResponse> {
    return this.execute(async () => {
      const order = await this.queryBus.execute<GetOrderQuery, OrderDetailDto>(
        new GetOrderQuery(request.orderId, request.customerId || undefined),
      );
      return this.toOrderResponse(order);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'ListOrders')
  async listOrders(request: ListOrdersRequest): Promise<ListOrdersResponse> {
    return this.execute(async () => {
      const result = await this.queryBus.execute<
        ListOrdersQuery,
        PagedResultDto<OrderSummaryDto>
      >(
        new ListOrdersQuery(
          request.page || 1,
          request.limit || 20,
          request.customerId || undefined,
        ),
      );
      return this.toListResponse(result);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'CancelOrder')
  async cancelOrder(request: CancelOrderRequest): Promise<OrderResponse> {
    return this.execute(async () => {
      const order = await this.commandBus.execute<
        CancelOrderCommand,
        OrderDetailDto
      >(
        new CancelOrderCommand(
          request.orderId,
          request.customerId || undefined,
          request.reason || undefined,
        ),
      );
      return this.toOrderResponse(order);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'AdminListOrders')
  async adminListOrders(
    request: AdminListOrdersRequest,
  ): Promise<ListOrdersResponse> {
    return this.execute(async () => {
      const result = await this.queryBus.execute<
        ListOrdersQuery,
        PagedResultDto<OrderSummaryDto>
      >(
        new ListOrdersQuery(
          request.page || 1,
          request.limit || 20,
          request.customerId || undefined,
          request.status || undefined,
        ),
      );
      return this.toListResponse(result);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'AdminCancelOrder')
  async adminCancelOrder(
    request: AdminCancelOrderRequest,
  ): Promise<OrderResponse> {
    return this.execute(async () => {
      const order = await this.commandBus.execute<
        CancelOrderCommand,
        OrderDetailDto
      >(
        new CancelOrderCommand(
          request.orderId,
          undefined,
          request.reason || undefined,
        ),
      );
      return this.toOrderResponse(order);
    });
  }

  @GrpcMethod(GRPC_SERVICE_NAMES.ORDERS, 'AdminRefundOrder')
  async adminRefundOrder(
    request: AdminRefundOrderRequest,
  ): Promise<OrderResponse> {
    return this.execute(async () => {
      const order = await this.commandBus.execute<
        AdminRefundOrderCommand,
        OrderDetailDto
      >(
        new AdminRefundOrderCommand(
          request.orderId,
          request.reason || undefined,
        ),
      );
      return this.toOrderResponse(order);
    });
  }

  private toCartResponse(cart: CartDto): CartResponse {
    return {
      customerId: cart.customerId,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: {
          amountMinor: item.unitPrice.amountMinor,
          currency: item.unitPrice.currency,
        },
      })),
      total: {
        amountMinor: cart.total.amountMinor,
        currency: cart.total.currency,
      },
      updatedAt: cart.updatedAt,
    };
  }

  private toOrderResponse(order: OrderDetailDto): OrderResponse {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      items: order.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: {
          amountMinor: item.unitPrice.amountMinor,
          currency: item.unitPrice.currency,
        },
        lineTotal: {
          amountMinor: item.lineTotal.amountMinor,
          currency: item.lineTotal.currency,
        },
      })),
      shippingAddress: {
        addressId: order.shippingAddress.addressId,
        receiverName: order.shippingAddress.receiverName,
        phoneNumber: order.shippingAddress.phoneNumber,
        provinceCode: order.shippingAddress.provinceCode,
        districtCode: order.shippingAddress.districtCode,
        wardCode: order.shippingAddress.wardCode,
        addressLine: order.shippingAddress.addressLine,
        postalCode: order.shippingAddress.postalCode,
      },
      total: {
        amountMinor: order.total.amountMinor,
        currency: order.total.currency,
      },
      paymentProvider: order.paymentProvider,
      paymentId: order.paymentId ?? '',
      paymentUrl: order.paymentUrl ?? '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      cancelledAt: order.cancelledAt ?? '',
      confirmedAt: order.confirmedAt ?? '',
    };
  }

  private async toListResponse(
    result: PagedResultDto<OrderSummaryDto>,
  ): Promise<ListOrdersResponse> {
    const orders: OrderResponse[] = [];
    for (const summary of result.items) {
      const detail = await this.queryBus.execute<GetOrderQuery, OrderDetailDto>(
        new GetOrderQuery(summary.id),
      );
      orders.push(this.toOrderResponse(detail));
    }
    return {
      orders,
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.toRpcException(error);
    }
  }

  private toRpcException(error: unknown): RpcException {
    if (error instanceof DomainException) {
      return new RpcException({
        code: this.mapGrpcCode(error.code),
        message: error.message,
      });
    }
    if (error instanceof Error) {
      return new RpcException({
        code: GrpcStatus.INTERNAL,
        message: error.message,
      });
    }
    return new RpcException({
      code: GrpcStatus.INTERNAL,
      message: 'Internal error',
    });
  }

  private mapGrpcCode(code: string): GrpcStatus {
    if (code.endsWith('_NOT_FOUND')) {
      return GrpcStatus.NOT_FOUND;
    }
    switch (code) {
      case 'INVALID_ORDER_TRANSITION':
      case 'PRODUCT_UNAVAILABLE':
      case 'INSUFFICIENT_STOCK':
      case 'EMPTY_CART':
      case 'STOCK_RESERVATION_FAILED':
      case 'PAYMENT_INTENT_FAILED':
        return GrpcStatus.FAILED_PRECONDITION;
      default:
        return GrpcStatus.INVALID_ARGUMENT;
    }
  }
}
