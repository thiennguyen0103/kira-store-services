import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { CurrencyCode } from '../enums/currency-code.enum';
import { CartItemNotFoundException } from '../exceptions/cart-item-not-found.exception';
import { EmptyCartException } from '../exceptions/empty-cart.exception';
import { CartId } from '../value-objects/cart-id.vo';
import { CustomerId } from '../value-objects/customer-id.vo';
import { Money } from '../value-objects/money.vo';
import { CartItem } from './cart-item.entity';

export interface CartProps {
  customerId: CustomerId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class Cart extends AggregateRoot<CartId> {
  private constructor(
    id: CartId,
    private props: CartProps,
  ) {
    super(id);
  }

  public static create(id: CartId, customerId: CustomerId): Cart {
    const now = new Date();
    return new Cart(id, {
      customerId,
      items: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(id: CartId, props: CartProps): Cart {
    return new Cart(id, props);
  }

  get customerId(): CustomerId {
    return this.props.customerId;
  }

  get items(): readonly CartItem[] {
    return this.props.items;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get total(): Money {
    if (this.props.items.length === 0) {
      return Money.create(0, CurrencyCode.VND);
    }
    const currency = this.props.items[0].unitPrice.currency;
    return this.props.items.reduce(
      (sum, item) => {
        if (item.unitPrice.currency !== currency) {
          throw new DomainException(
            'All cart items must share the same currency.',
            { code: 'CURRENCY_MISMATCH' },
          );
        }
        return sum.add(item.lineTotal);
      },
      Money.create(0, currency),
    );
  }

  public findItem(productId: string, variantId: string): CartItem | undefined {
    return this.props.items.find((item) => item.matches(productId, variantId));
  }

  public addItem(item: CartItem): void {
    const existing = this.findItem(item.productId, item.variantId);
    if (existing) {
      existing.updateQuantity(existing.quantity + item.quantity);
      existing.updateSnapshot({
        productName: item.productName,
        sku: item.sku,
        unitPrice: item.unitPrice,
      });
    } else {
      this.props.items.push(item);
    }
    this.touch();
  }

  public updateItemQuantity(
    productId: string,
    variantId: string,
    quantity: number,
  ): void {
    const item = this.findItem(productId, variantId);
    if (!item) {
      throw new CartItemNotFoundException(productId, variantId);
    }
    item.updateQuantity(quantity);
    this.touch();
  }

  public removeItem(productId: string, variantId: string): void {
    const index = this.props.items.findIndex((item) =>
      item.matches(productId, variantId),
    );
    if (index < 0) {
      throw new CartItemNotFoundException(productId, variantId);
    }
    this.props.items.splice(index, 1);
    this.touch();
  }

  public clear(): void {
    this.props.items = [];
    this.touch();
  }

  public assertNotEmpty(): void {
    if (this.props.items.length === 0) {
      throw new EmptyCartException();
    }
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
