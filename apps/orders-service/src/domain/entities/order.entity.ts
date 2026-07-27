import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { PaymentProvider } from 'libs/shared/enums';
import { OrderStatus as OrderStatusEnum } from 'libs/shared/enums';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { OrderCancelledEvent } from '../events/order-cancelled.event';
import { OrderConfirmedEvent } from '../events/order-confirmed.event';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderPaymentPendingEvent } from '../events/order-payment-pending.event';
import { CustomerId } from '../value-objects/customer-id.vo';
import { Money } from '../value-objects/money.vo';
import { OrderId } from '../value-objects/order-id.vo';
import { OrderStatus } from '../value-objects/order-status.vo';
import { ShippingAddress } from '../value-objects/shipping-address.vo';
import { OrderItem } from './order-item.entity';

export interface OrderProps {
  customerId: CustomerId;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  total: Money;
  paymentProvider: PaymentProvider;
  paymentId?: string;
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  confirmedAt?: Date;
}

export class Order extends AggregateRoot<OrderId> {
  private constructor(
    id: OrderId,
    private props: OrderProps,
  ) {
    super(id);
  }

  public static create(
    id: OrderId,
    props: {
      customerId: CustomerId;
      items: OrderItem[];
      shippingAddress: ShippingAddress;
      paymentProvider: PaymentProvider;
    },
  ): Order {
    if (props.items.length === 0) {
      throw new DomainException('Order must contain at least one item.', {
        code: 'EMPTY_ORDER',
      });
    }

    const currency = props.items[0].unitPrice.currency;
    for (const item of props.items) {
      if (item.unitPrice.currency !== currency) {
        throw new DomainException(
          'All order items must share the same currency.',
          {
            code: 'CURRENCY_MISMATCH',
          },
        );
      }
    }

    const total = props.items.reduce(
      (sum, item) => sum.add(item.lineTotal),
      Money.create(0, currency),
    );

    const now = new Date();
    const order = new Order(id, {
      customerId: props.customerId,
      status: OrderStatus.create(OrderStatusEnum.PENDING),
      items: [...props.items],
      shippingAddress: props.shippingAddress,
      total,
      paymentProvider: props.paymentProvider,
      createdAt: now,
      updatedAt: now,
    });

    order.addDomainEvent(new OrderCreatedEvent(order.id));
    return order;
  }

  public static restore(id: OrderId, props: OrderProps): Order {
    return new Order(id, props);
  }

  get customerId(): CustomerId {
    return this.props.customerId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get items(): readonly OrderItem[] {
    return this.props.items;
  }

  get shippingAddress(): ShippingAddress {
    return this.props.shippingAddress;
  }

  get total(): Money {
    return this.props.total;
  }

  get paymentProvider(): PaymentProvider {
    return this.props.paymentProvider;
  }

  get paymentId(): string | undefined {
    return this.props.paymentId;
  }

  get paymentUrl(): string | undefined {
    return this.props.paymentUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get confirmedAt(): Date | undefined {
    return this.props.confirmedAt;
  }

  public markAwaitingStock(): void {
    this.transition(OrderStatusEnum.AWAITING_STOCK);
  }

  public markPaymentPending(paymentId?: string, paymentUrl?: string): void {
    this.transition(OrderStatusEnum.PAYMENT_PENDING);
    if (paymentId !== undefined) {
      this.props.paymentId = paymentId;
    }
    if (paymentUrl !== undefined) {
      this.props.paymentUrl = paymentUrl;
    }
    this.addDomainEvent(
      new OrderPaymentPendingEvent(
        this.id,
        this.props.paymentId,
        this.props.paymentUrl,
      ),
    );
  }

  public markPaid(paymentId?: string): void {
    this.transition(OrderStatusEnum.PAID);
    if (paymentId !== undefined) {
      this.props.paymentId = paymentId;
    }
  }

  public confirm(): void {
    this.transition(OrderStatusEnum.CONFIRMED);
    this.props.confirmedAt = new Date();
    this.addDomainEvent(new OrderConfirmedEvent(this.id));
  }

  public cancel(reason?: string): void {
    this.transition(OrderStatusEnum.CANCELLED);
    this.props.cancelledAt = new Date();
    this.addDomainEvent(new OrderCancelledEvent(this.id, reason));
  }

  public startRefund(): void {
    this.transition(OrderStatusEnum.REFUNDING);
  }

  public markRefunded(): void {
    this.transition(OrderStatusEnum.REFUNDED);
  }

  public belongsTo(customerId: CustomerId): boolean {
    return this.props.customerId.equals(customerId);
  }

  private transition(next: OrderStatusEnum): void {
    this.props.status = this.props.status.transitionTo(next);
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
