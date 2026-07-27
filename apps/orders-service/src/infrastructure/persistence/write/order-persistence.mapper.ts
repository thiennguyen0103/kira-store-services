import { Injectable } from '@nestjs/common';
import { PaymentProvider } from 'libs/shared/enums';
import { OrderStatus as OrderStatusEnum } from 'libs/shared/enums';
import { Cart } from 'apps/orders-service/src/domain/entities/cart.entity';
import { CartItem } from 'apps/orders-service/src/domain/entities/cart-item.entity';
import { Order } from 'apps/orders-service/src/domain/entities/order.entity';
import { OrderItem } from 'apps/orders-service/src/domain/entities/order-item.entity';
import { CurrencyCode } from 'apps/orders-service/src/domain/enums/currency-code.enum';
import { CartId } from 'apps/orders-service/src/domain/value-objects/cart-id.vo';
import { CartItemId } from 'apps/orders-service/src/domain/value-objects/cart-item-id.vo';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { Money } from 'apps/orders-service/src/domain/value-objects/money.vo';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderItemId } from 'apps/orders-service/src/domain/value-objects/order-item-id.vo';
import { OrderStatus } from 'apps/orders-service/src/domain/value-objects/order-status.vo';
import { ShippingAddress } from 'apps/orders-service/src/domain/value-objects/shipping-address.vo';
import type { CartDto } from 'apps/orders-service/src/application/dto/cart.dto';
import type { OrderDetailDto } from 'apps/orders-service/src/application/dto/order.dto';
import { CartItemOrmEntity } from './cart-item.orm-entity';
import { CartOrmEntity } from './cart.orm-entity';
import { OrderItemOrmEntity } from './order-item.orm-entity';
import { OrderOrmEntity } from './order.orm-entity';

@Injectable()
export class OrderPersistenceMapper {
  toOrderDomain(orm: OrderOrmEntity): Order {
    return Order.restore(OrderId.restore(orm.id), {
      customerId: CustomerId.restore(orm.customerId),
      status: OrderStatus.restore(orm.status as OrderStatusEnum),
      items: (orm.items ?? []).map((item) => this.toOrderItemDomain(item)),
      shippingAddress: ShippingAddress.restore({
        addressId: orm.shippingAddressId,
        receiverName: orm.shippingReceiverName,
        phoneNumber: orm.shippingPhoneNumber,
        provinceCode: orm.shippingProvinceCode,
        districtCode: orm.shippingDistrictCode,
        wardCode: orm.shippingWardCode,
        addressLine: orm.shippingAddressLine,
        postalCode: orm.shippingPostalCode,
      }),
      total: Money.restore(
        Number(orm.totalAmount),
        orm.totalCurrency as CurrencyCode,
      ),
      paymentProvider: orm.paymentProvider as PaymentProvider,
      paymentId: orm.paymentId ?? undefined,
      paymentUrl: orm.paymentUrl ?? undefined,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
      cancelledAt: orm.cancelledAt ?? undefined,
      confirmedAt: orm.confirmedAt ?? undefined,
    });
  }

  toOrderItemDomain(orm: OrderItemOrmEntity): OrderItem {
    return OrderItem.restore(OrderItemId.restore(orm.id), {
      productId: orm.productId,
      variantId: orm.variantId,
      productName: orm.productName,
      sku: orm.sku,
      quantity: orm.quantity,
      unitPrice: Money.restore(
        Number(orm.unitPriceAmount),
        orm.unitPriceCurrency as CurrencyCode,
      ),
    });
  }

  toOrderOrm(order: Order): OrderOrmEntity {
    const orm = new OrderOrmEntity();
    orm.id = order.id.value;
    orm.customerId = order.customerId.value;
    orm.status = order.status.value;
    orm.shippingAddressId = order.shippingAddress.addressId;
    orm.shippingReceiverName = order.shippingAddress.receiverName;
    orm.shippingPhoneNumber = order.shippingAddress.phoneNumber;
    orm.shippingProvinceCode = order.shippingAddress.provinceCode;
    orm.shippingDistrictCode = order.shippingAddress.districtCode;
    orm.shippingWardCode = order.shippingAddress.wardCode;
    orm.shippingAddressLine = order.shippingAddress.addressLine;
    orm.shippingPostalCode = order.shippingAddress.postalCode;
    orm.totalAmount = String(order.total.amount);
    orm.totalCurrency = order.total.currency;
    orm.paymentProvider = order.paymentProvider;
    orm.paymentId = order.paymentId ?? null;
    orm.paymentUrl = order.paymentUrl ?? null;
    orm.createdAt = order.createdAt;
    orm.updatedAt = order.updatedAt;
    orm.cancelledAt = order.cancelledAt ?? null;
    orm.confirmedAt = order.confirmedAt ?? null;
    return orm;
  }

  toOrderItemOrm(item: OrderItem, orderId: string): OrderItemOrmEntity {
    const orm = new OrderItemOrmEntity();
    orm.id = item.id.value;
    orm.orderId = orderId;
    orm.productId = item.productId;
    orm.variantId = item.variantId;
    orm.productName = item.productName;
    orm.sku = item.sku;
    orm.quantity = item.quantity;
    orm.unitPriceAmount = String(item.unitPrice.amount);
    orm.unitPriceCurrency = item.unitPrice.currency;
    return orm;
  }

  toCartDomain(orm: CartOrmEntity): Cart {
    return Cart.restore(CartId.restore(orm.id), {
      customerId: CustomerId.restore(orm.customerId),
      items: (orm.items ?? []).map((item) => this.toCartItemDomain(item)),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  toCartItemDomain(orm: CartItemOrmEntity): CartItem {
    return CartItem.restore(CartItemId.restore(orm.id), {
      productId: orm.productId,
      variantId: orm.variantId,
      productName: orm.productName,
      sku: orm.sku,
      quantity: orm.quantity,
      unitPrice: Money.restore(
        Number(orm.unitPriceAmount),
        orm.unitPriceCurrency as CurrencyCode,
      ),
    });
  }

  toCartOrm(cart: Cart): CartOrmEntity {
    const orm = new CartOrmEntity();
    orm.id = cart.id.value;
    orm.customerId = cart.customerId.value;
    orm.createdAt = cart.createdAt;
    orm.updatedAt = cart.updatedAt;
    return orm;
  }

  toCartItemOrm(item: CartItem, cartId: string): CartItemOrmEntity {
    const orm = new CartItemOrmEntity();
    orm.id = item.id.value;
    orm.cartId = cartId;
    orm.productId = item.productId;
    orm.variantId = item.variantId;
    orm.productName = item.productName;
    orm.sku = item.sku;
    orm.quantity = item.quantity;
    orm.unitPriceAmount = String(item.unitPrice.amount);
    orm.unitPriceCurrency = item.unitPrice.currency;
    return orm;
  }

  toOrderDetailDto(order: Order): OrderDetailDto {
    return {
      id: order.id.value,
      customerId: order.customerId.value,
      status: order.status.value,
      items: order.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: {
          amountMinor: item.unitPrice.amount,
          currency: item.unitPrice.currency,
        },
        lineTotal: {
          amountMinor: item.lineTotal.amount,
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
        amountMinor: order.total.amount,
        currency: order.total.currency,
      },
      paymentProvider: order.paymentProvider,
      paymentId: order.paymentId,
      paymentUrl: order.paymentUrl,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      cancelledAt: order.cancelledAt?.toISOString(),
      confirmedAt: order.confirmedAt?.toISOString(),
    };
  }

  toOrderDetailDtoFromOrm(orm: OrderOrmEntity): OrderDetailDto {
    return this.toOrderDetailDto(this.toOrderDomain(orm));
  }

  toCartDto(cart: Cart): CartDto {
    return {
      customerId: cart.customerId.value,
      items: cart.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: {
          amountMinor: item.unitPrice.amount,
          currency: item.unitPrice.currency,
        },
      })),
      total: {
        amountMinor: cart.total.amount,
        currency: cart.total.currency,
      },
      updatedAt: cart.updatedAt.toISOString(),
    };
  }
}
