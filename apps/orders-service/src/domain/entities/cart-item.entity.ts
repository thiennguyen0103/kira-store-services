import { Entity } from 'libs/shared/domain/entity';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { CartItemId } from '../value-objects/cart-item-id.vo';
import { Money } from '../value-objects/money.vo';

export interface CartItemProps {
  productId: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: Money;
}

export class CartItem extends Entity<CartItemId> {
  private constructor(
    id: CartItemId,
    private props: CartItemProps,
  ) {
    super(id);
  }

  public static create(id: CartItemId, props: CartItemProps): CartItem {
    CartItem.assertValid(props);
    return new CartItem(id, { ...props });
  }

  public static restore(id: CartItemId, props: CartItemProps): CartItem {
    return new CartItem(id, props);
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

  public matches(productId: string, variantId: string): boolean {
    return (
      this.props.productId === productId && this.props.variantId === variantId
    );
  }

  public updateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainException('Quantity must be a positive integer.', {
        code: 'INVALID_CART_ITEM_QUANTITY',
        details: { quantity },
      });
    }
    this.props.quantity = quantity;
  }

  public updateSnapshot(props: {
    productName: string;
    sku: string;
    unitPrice: Money;
  }): void {
    this.props.productName = props.productName;
    this.props.sku = props.sku;
    this.props.unitPrice = props.unitPrice;
  }

  private static assertValid(props: CartItemProps): void {
    if (!props.productId?.trim()) {
      throw new DomainException('Product id is required.', {
        code: 'INVALID_CART_ITEM',
      });
    }
    if (!props.variantId?.trim()) {
      throw new DomainException('Variant id is required.', {
        code: 'INVALID_CART_ITEM',
      });
    }
    if (!Number.isInteger(props.quantity) || props.quantity <= 0) {
      throw new DomainException('Quantity must be a positive integer.', {
        code: 'INVALID_CART_ITEM_QUANTITY',
        details: { quantity: props.quantity },
      });
    }
  }
}
