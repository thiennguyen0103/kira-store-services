import { ValueObject } from 'libs/shared/domain/value-object';
import { OrderStatus as OrderStatusEnum } from 'libs/shared/enums';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface OrderStatusProps {
  value: OrderStatusEnum;
}

const ALLOWED_TRANSITIONS: Record<OrderStatusEnum, OrderStatusEnum[]> = {
  [OrderStatusEnum.PENDING]: [
    OrderStatusEnum.AWAITING_STOCK,
    OrderStatusEnum.CANCELLED,
  ],
  [OrderStatusEnum.AWAITING_STOCK]: [
    OrderStatusEnum.PAYMENT_PENDING,
    OrderStatusEnum.CANCELLED,
  ],
  [OrderStatusEnum.PAYMENT_PENDING]: [
    OrderStatusEnum.PAID,
    OrderStatusEnum.CANCELLED,
  ],
  [OrderStatusEnum.PAID]: [
    OrderStatusEnum.CONFIRMED,
    OrderStatusEnum.REFUNDING,
    OrderStatusEnum.CANCELLED,
  ],
  [OrderStatusEnum.CONFIRMED]: [OrderStatusEnum.REFUNDING],
  [OrderStatusEnum.CANCELLED]: [],
  [OrderStatusEnum.REFUNDING]: [OrderStatusEnum.REFUNDED],
  [OrderStatusEnum.REFUNDED]: [],
};

export class OrderStatus extends ValueObject<OrderStatusProps> {
  private constructor(props: OrderStatusProps) {
    super(props);
  }

  public static create(
    value: OrderStatusEnum = OrderStatusEnum.PENDING,
  ): OrderStatus {
    if (!Object.values(OrderStatusEnum).includes(value)) {
      throw new DomainException('Invalid order status.', {
        code: 'INVALID_ORDER_STATUS',
        details: { value },
      });
    }
    return new OrderStatus({ value });
  }

  public static restore(value: OrderStatusEnum): OrderStatus {
    return new OrderStatus({ value });
  }

  public get value(): OrderStatusEnum {
    return this.props.value;
  }

  public canTransitionTo(next: OrderStatusEnum): boolean {
    return ALLOWED_TRANSITIONS[this.value].includes(next);
  }

  public transitionTo(next: OrderStatusEnum): OrderStatus {
    if (!this.canTransitionTo(next)) {
      throw new DomainException(
        `Cannot transition order from ${this.value} to ${next}.`,
        {
          code: 'INVALID_ORDER_TRANSITION',
          details: { from: this.value, to: next },
        },
      );
    }
    return OrderStatus.create(next);
  }

  public isTerminal(): boolean {
    return (
      this.value === OrderStatusEnum.CANCELLED ||
      this.value === OrderStatusEnum.REFUNDED
    );
  }
}
