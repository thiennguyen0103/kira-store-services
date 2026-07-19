import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface PostalCodeProps {
  value: string;
}

export class PostalCode extends ValueObject<PostalCodeProps> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 12;

  private constructor(props: PostalCodeProps) {
    super(props);
  }

  public static create(value: string): PostalCode {
    const normalized = this.normalize(value);

    this.validate(normalized);

    return new PostalCode({
      value: normalized,
    });
  }

  public static restore(value: string): PostalCode {
    return new PostalCode({
      value,
    });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }

  private static normalize(value: string): string {
    return value.trim().toUpperCase();
  }

  private static validate(value: string): void {
    if (!value) {
      throw new DomainException('Postal code is required.', {
        code: 'POSTAL_CODE_REQUIRED',
      });
    }

    if (value.length < this.MIN_LENGTH || value.length > this.MAX_LENGTH) {
      throw new DomainException(
        `Postal code must be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH} characters.`,
        {
          code: 'INVALID_POSTAL_CODE',
        },
      );
    }

    // Letters, numbers, spaces and hyphens
    if (!/^[A-Z0-9 -]+$/.test(value)) {
      throw new DomainException('Postal code contains invalid characters.', {
        code: 'INVALID_POSTAL_CODE_FORMAT',
      });
    }
  }
}
