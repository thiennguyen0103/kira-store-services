import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface ProductNameProps {
  value: string;
}

export class ProductName extends ValueObject<ProductNameProps> {
  private static readonly MAX_LENGTH = 255;

  private constructor(props: ProductNameProps) {
    super(props);
  }

  public static create(raw: string): ProductName {
    const value = raw.trim().replace(/\s+/g, ' ');

    if (!value) {
      throw new DomainException('Product name is required.', {
        code: 'PRODUCT_NAME_REQUIRED',
      });
    }

    if (value.length > this.MAX_LENGTH) {
      throw new DomainException('Product name is too long.', {
        code: 'PRODUCT_NAME_TOO_LONG',
      });
    }

    return new ProductName({ value });
  }

  public static restore(value: string): ProductName {
    return new ProductName({ value });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
