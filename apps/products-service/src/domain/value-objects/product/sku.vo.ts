import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface SkuProps {
  value: string;
}

export class Sku extends ValueObject<SkuProps> {
  private static readonly MAX_LENGTH = 64;
  private static readonly PATTERN = /^[A-Z0-9][A-Z0-9\-_]*$/;

  private constructor(props: SkuProps) {
    super(props);
  }

  public static create(raw: string): Sku {
    const value = raw.trim().toUpperCase();

    if (!value) {
      throw new DomainException('SKU is required.', {
        code: 'SKU_REQUIRED',
      });
    }

    if (value.length > this.MAX_LENGTH) {
      throw new DomainException('SKU is too long.', {
        code: 'SKU_TOO_LONG',
      });
    }

    if (!this.PATTERN.test(value)) {
      throw new DomainException(
        'SKU must be alphanumeric (uppercase) with hyphens or underscores.',
        { code: 'INVALID_SKU' },
      );
    }

    return new Sku({ value });
  }

  public static restore(value: string): Sku {
    return new Sku({ value });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
