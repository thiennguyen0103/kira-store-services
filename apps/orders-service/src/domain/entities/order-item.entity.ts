import { Entity } from 'libs/shared/domain/entity';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { Money } from '../value-objects/money.vo';
import { OrderItemId } from '../value-objects/order-item-id.vo';

export interface OrderItemProps {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: Money;
}

export class OrderItem extends Entity<OrderItemId> {
  private constructor(
    id: OrderItemId,
    private props: OrderItemProps,
  ) {
    super(id);
  }

  public static create(id: OrderItemId, props: OrderItemProps): OrderItem {
    OrderItem.assertValid(props);
    return new OrderItem(id, { ...props });
  }

  public static restore(id: OrderItemId, props: OrderItemProps): OrderItem {
    return new OrderItem(id, props);
  }

  get productId(): string {
    return this.props.productId;
  }

  get variantId(): string {
    return this.props.variantId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get sku(): string {
    return this.props.sku;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get lineTotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity);
  }

  private static assertValid(props: OrderItemProps): void {
    if (!props.productId?.trim()) {
      throw new DomainException('Product id is required.', {
        code: 'INVALID_ORDER_ITEM',
      });
    }
    if (!props.variantId?.trim()) {
      throw new DomainException('Variant id is required.', {
        code: 'INVALID_ORDER_ITEM',
      });
    }
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new DomainException('Quantity must be a positive integer.', {
        code: 'INVALID_ORDER_ITEM_QUANTITY',
        details: { quantity: props.quantity },
      });
    }
  }
}
