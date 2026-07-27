import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelOrderCommand } from 'apps/orders-service/src/application/commands/cancel-order/cancel-order.command';
import type { OrderDetailDto } from 'apps/orders-service/src/application/dto/order.dto';
import { CartRepositoryPort } from 'apps/orders-service/src/application/ports/cart-repository.port';
import { OrderEventsPublisherPort } from 'apps/orders-service/src/application/ports/order-events-publisher.port';
import { OrderRepositoryPort } from 'apps/orders-service/src/application/ports/order-repository.port';
import { PaymentsClientPort } from 'apps/orders-service/src/application/ports/payments-client.port';
import type { PaymentIntentResult } from 'apps/orders-service/src/application/ports/payments-client.port';
import { ProductsClientPort } from 'apps/orders-service/src/application/ports/products-client.port';
import { UsersClientPort } from 'apps/orders-service/src/application/ports/users-client.port';
import { Order } from 'apps/orders-service/src/domain/entities/order.entity';
import { OrderItem } from 'apps/orders-service/src/domain/entities/order-item.entity';
import { CurrencyCode } from 'apps/orders-service/src/domain/enums/currency-code.enum';
import { CartNotFoundException } from 'apps/orders-service/src/domain/exceptions/cart-not-found.exception';
import { CustomerId } from 'apps/orders-service/src/domain/value-objects/customer-id.vo';
import { Money } from 'apps/orders-service/src/domain/value-objects/money.vo';
import { OrderId } from 'apps/orders-service/src/domain/value-objects/order-id.vo';
import { OrderItemId } from 'apps/orders-service/src/domain/value-objects/order-item-id.vo';
import { ShippingAddress } from 'apps/orders-service/src/domain/value-objects/shipping-address.vo';
import { OrderPersistenceMapper } from 'apps/orders-service/src/infrastructure/persistence/write/order-persistence.mapper';
import { EVENT_NAMES } from 'libs/shared/constants';
import { PaymentProvider } from 'libs/shared/enums';
import type { OrderPaymentPendingEvent } from 'libs/shared/events';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { CreateOrderCommand } from './create-order.command';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    private readonly carts: CartRepositoryPort,
    private readonly orders: OrderRepositoryPort,
    private readonly products: ProductsClientPort,
    private readonly users: UsersClientPort,
    private readonly payments: PaymentsClientPort,
    private readonly events: OrderEventsPublisherPort,
    private readonly mapper: OrderPersistenceMapper,
    private readonly config: ConfigService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CreateOrderCommand): Promise<OrderDetailDto> {
    const customerId = CustomerId.restore(command.customerId);
    const cart = await this.carts.findByCustomerId(customerId);
    if (!cart) {
      throw new CartNotFoundException(command.customerId);
    }
    cart.assertNotEmpty();

    const paymentProvider = this.parsePaymentProvider(command.paymentProvider);
    const orderItems: OrderItem[] = [];

    for (const line of cart.items) {
      const snapshot = await this.products.getProductVariant(
        line.productId,
        line.variantId,
      );

      if (!snapshot.isActive || snapshot.productStatus !== 'ACTIVE') {
        throw new DomainException('Product variant is not available.', {
          code: 'PRODUCT_UNAVAILABLE',
          details: {
            productId: line.productId,
            variantId: line.variantId,
          },
        });
      }

      if (snapshot.available < line.quantity) {
        throw new DomainException('Insufficient stock for cart item.', {
          code: 'INSUFFICIENT_STOCK',
          details: {
            productId: line.productId,
            variantId: line.variantId,
            requested: line.quantity,
            available: snapshot.available,
          },
        });
      }

      orderItems.push(
        OrderItem.create(OrderItemId.create(), {
          productId: snapshot.productId,
          variantId: snapshot.variantId,
          productName: snapshot.productName,
          sku: snapshot.sku,
          quantity: line.quantity,
          unitPrice: Money.create(
            snapshot.unitPriceAmount,
            snapshot.currency as CurrencyCode,
          ),
        }),
      );
    }

    const address = await this.users.getAddressById(
      command.customerId,
      command.addressId,
    );
    const shippingAddress = ShippingAddress.create({
      addressId: address.addressId,
      receiverName: address.receiverName,
      phoneNumber: address.phoneNumber,
      provinceCode: address.provinceCode,
      districtCode: address.districtCode,
      wardCode: address.wardCode,
      addressLine: address.addressLine,
      postalCode: address.postalCode,
    });

    const order = Order.create(OrderId.create(), {
      customerId,
      items: orderItems,
      shippingAddress,
      paymentProvider,
    });
    // Sync checkout reserves stock via gRPC — do not emit ORDER_CREATED (would double-reserve).
    order.clearDomainEvents();
    order.markAwaitingStock();
    await this.orders.save(order);

    const stockItems = order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    let cancelledAfterReserve = false;
    try {
      const reservation = await this.products.reserveStock(
        order.id.value,
        stockItems,
      );
      if (!reservation.success) {
        await this.safeCancel(
          order.id.value,
          reservation.message || 'Stock reservation failed',
        );
        cancelledAfterReserve = true;
        throw new DomainException(
          reservation.message || 'Failed to reserve stock for order.',
          {
            code: 'STOCK_RESERVATION_FAILED',
            details: { orderId: order.id.value },
          },
        );
      }
    } catch (error) {
      if (!cancelledAfterReserve) {
        await this.safeCancel(order.id.value, 'Stock reservation failed');
      }
      throw error;
    }

    let payment: PaymentIntentResult;
    try {
      payment = await this.payments.createPaymentIntent({
        orderId: order.id.value,
        amountMinor: order.total.amount,
        currency: order.total.currency,
        provider: paymentProvider,
        customerId: command.customerId,
        description: `Order ${order.id.value}`,
        successUrl: this.config.getOrThrow<string>('CHECKOUT_SUCCESS_URL'),
        cancelUrl: this.config.getOrThrow<string>('CHECKOUT_CANCEL_URL'),
      });
    } catch (error) {
      await this.safeCancel(order.id.value, 'Payment intent creation failed');
      throw error;
    }

    order.markPaymentPending(payment.paymentId, payment.checkoutUrl);
    await this.orders.save(order);

    cart.clear();
    await this.carts.save(cart);

    const pendingPayload: OrderPaymentPendingEvent = {
      orderId: order.id.value,
      occurredAt: new Date().toISOString(),
    };
    await this.events.publish(
      EVENT_NAMES.ORDER_PAYMENT_PENDING,
      pendingPayload,
    );

    this.logger.log(
      `Checkout completed for order ${order.id.value} payment=${payment.paymentId}`,
    );
    return this.mapper.toOrderDetailDto(order);
  }

  private async safeCancel(orderId: string, reason: string): Promise<void> {
    try {
      await this.commandBus.execute(
        new CancelOrderCommand(orderId, undefined, reason),
      );
    } catch (cancelError) {
      this.logger.error(
        `Failed to cancel order ${orderId} after checkout failure`,
        cancelError instanceof Error ? cancelError.stack : undefined,
      );
    }
  }

  private parsePaymentProvider(value: string): PaymentProvider {
    const normalized = value?.trim().toUpperCase();
    if (
      !normalized ||
      !Object.values(PaymentProvider).includes(normalized as PaymentProvider)
    ) {
      throw new DomainException('Unsupported payment provider.', {
        code: 'INVALID_PAYMENT_PROVIDER',
        details: { paymentProvider: value },
      });
    }
    return normalized as PaymentProvider;
  }
}
