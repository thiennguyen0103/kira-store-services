import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface BrandNameProps {
  value: string;
}

export class BrandName extends ValueObject<BrandNameProps> {
  private static readonly MAX_LENGTH = 150;

  private constructor(props: BrandNameProps) {
    super(props);
  }

  public static create(raw: string): BrandName {
    const value = raw.trim().replace(/\s+/g, ' ');

    if (!value) {
      throw new DomainException('Brand name is required.', {
        code: 'BRAND_NAME_REQUIRED',
      });
    }

    if (value.length > this.MAX_LENGTH) {
      throw new DomainException('Brand name is too long.', {
        code: 'BRAND_NAME_TOO_LONG',
      });
    }

    return new BrandName({ value });
  }

  public static restore(value: string): BrandName {
    return new BrandName({ value });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
