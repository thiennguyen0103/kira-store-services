import { Observable } from 'rxjs';
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
  PingResponse,
  RemoveCartItemRequest,
  UpdateCartItemRequest,
} from 'libs/shared/generated/orders';

export abstract class OrdersClientPort {
  abstract ping(): Observable<PingResponse>;

  abstract getCart(request: GetCartRequest): Observable<CartResponse>;

  abstract addCartItem(request: AddCartItemRequest): Observable<CartResponse>;

  abstract updateCartItem(
    request: UpdateCartItemRequest,
  ): Observable<CartResponse>;

  abstract removeCartItem(
    request: RemoveCartItemRequest,
  ): Observable<CartResponse>;

  abstract clearCart(request: ClearCartRequest): Observable<CartResponse>;

  abstract checkout(request: CheckoutRequest): Observable<CheckoutResponse>;

  abstract getOrder(request: GetOrderRequest): Observable<OrderResponse>;

  abstract listOrders(
    request: ListOrdersRequest,
  ): Observable<ListOrdersResponse>;

  abstract cancelOrder(request: CancelOrderRequest): Observable<OrderResponse>;

  abstract adminListOrders(
    request: AdminListOrdersRequest,
  ): Observable<ListOrdersResponse>;

  abstract adminCancelOrder(
    request: AdminCancelOrderRequest,
  ): Observable<OrderResponse>;

  abstract adminRefundOrder(
    request: AdminRefundOrderRequest,
  ): Observable<OrderResponse>;
}
