import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface ProductDescriptionProps {
  value: string;
}

export class ProductDescription extends ValueObject<ProductDescriptionProps> {
  private static readonly MAX_LENGTH = 10_000;

  private constructor(props: ProductDescriptionProps) {
    super(props);
  }

  public static create(raw: string): ProductDescription {
    const value = raw.trim();

    if (!value) {
      throw new DomainException('Product description cannot be empty.', {
        code: 'PRODUCT_DESCRIPTION_EMPTY',
      });
    }

    if (value.length > this.MAX_LENGTH) {
      throw new DomainException('Product description is too long.', {
        code: 'PRODUCT_DESCRIPTION_TOO_LONG',
      });
    }

    return new ProductDescription({ value });
  }

  public static restore(value: string): ProductDescription {
    return new ProductDescription({ value });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
