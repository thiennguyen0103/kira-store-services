import { Entity } from 'libs/shared/domain/entity';
import { Money } from '../value-objects/shared/money.vo';
import { StockLevel } from '../value-objects/shared/stock-level.vo';
import { Sku } from '../value-objects/product/sku.vo';
import { VariantId } from '../value-objects/product/variant-id.vo';
import { VariantOptions } from '../value-objects/product/variant-options.vo';

export interface ProductVariantProps {
  sku: Sku;
  options: VariantOptions;
  price: Money;
  stock: StockLevel;
  barcode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductVariant extends Entity<VariantId> {
  private constructor(
    id: VariantId,
    private props: ProductVariantProps,
  ) {
    super(id);
  }

  public static create(
    id: VariantId,
    props: Omit<ProductVariantProps, 'createdAt' | 'updatedAt' | 'isActive'> & {
      isActive?: boolean;
    },
  ): ProductVariant {
    const now = new Date();

    return new ProductVariant(id, {
      sku: props.sku,
      options: props.options,
      price: props.price,
      stock: props.stock,
      barcode: props.barcode,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(
    id: VariantId,
    props: ProductVariantProps,
  ): ProductVariant {
    return new ProductVariant(id, props);
  }

  get sku(): Sku {
    return this.props.sku;
  }

  get options(): VariantOptions {
    return this.props.options;
  }

  get price(): Money {
    return this.props.price;
  }

  get stock(): StockLevel {
    return this.props.stock;
  }

  get barcode(): string | undefined {
    return this.props.barcode;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public update(props: {
    options?: VariantOptions;
    price?: Money;
    barcode?: string | null;
    isActive?: boolean;
  }): void {
    if (props.options !== undefined) {
      this.props.options = props.options;
    }
    if (props.price !== undefined) {
      this.props.price = props.price;
    }
    if (props.barcode !== undefined) {
      this.props.barcode = props.barcode ?? undefined;
    }
    if (props.isActive !== undefined) {
      this.props.isActive = props.isActive;
    }
    this.touch();
  }

  public setStock(stock: StockLevel): void {
    this.props.stock = stock;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
