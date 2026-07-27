import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { GRPC_SERVICE_NAMES, SERVICE_TOKENS } from 'libs/shared/constants';
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
  OrdersServiceClient,
  PingResponse,
  RemoveCartItemRequest,
  UpdateCartItemRequest,
} from 'libs/shared/generated/orders';
import { OrdersClientPort } from '../../application/ports/orders-client.port';

@Injectable()
export class OrdersClient extends OrdersClientPort implements OnModuleInit {
  private ordersService!: OrdersServiceClient;

  constructor(
    @Inject(SERVICE_TOKENS.ORDERS_SERVICE)
    private readonly client: ClientGrpc,
  ) {
    super();
  }

  onModuleInit(): void {
    this.ordersService = this.client.getService<OrdersServiceClient>(
      GRPC_SERVICE_NAMES.ORDERS,
    );
  }

  ping(): Observable<PingResponse> {
    return this.ordersService.ping({});
  }

  getCart(request: GetCartRequest): Observable<CartResponse> {
    return this.ordersService.getCart(request);
  }

  addCartItem(request: AddCartItemRequest): Observable<CartResponse> {
    return this.ordersService.addCartItem(request);
  }

  updateCartItem(request: UpdateCartItemRequest): Observable<CartResponse> {
    return this.ordersService.updateCartItem(request);
  }

  removeCartItem(request: RemoveCartItemRequest): Observable<CartResponse> {
    return this.ordersService.removeCartItem(request);
  }

  clearCart(request: ClearCartRequest): Observable<CartResponse> {
    return this.ordersService.clearCart(request);
  }

  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.ordersService.checkout(request);
  }

  getOrder(request: GetOrderRequest): Observable<OrderResponse> {
    return this.ordersService.getOrder(request);
  }

  listOrders(request: ListOrdersRequest): Observable<ListOrdersResponse> {
    return this.ordersService.listOrders(request);
  }

  cancelOrder(request: CancelOrderRequest): Observable<OrderResponse> {
    return this.ordersService.cancelOrder(request);
  }

  adminListOrders(
    request: AdminListOrdersRequest,
  ): Observable<ListOrdersResponse> {
    return this.ordersService.adminListOrders(request);
  }

  adminCancelOrder(
    request: AdminCancelOrderRequest,
  ): Observable<OrderResponse> {
    return this.ordersService.adminCancelOrder(request);
  }

  adminRefundOrder(
    request: AdminRefundOrderRequest,
  ): Observable<OrderResponse> {
    return this.ordersService.adminRefundOrder(request);
  }
}
