import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

interface AddressLineProps {
  value: string;
}

export class AddressLine extends ValueObject<AddressLineProps> {
  private static readonly MAX_LENGTH = 255;
  private static readonly MIN_LENGTH = 5;

  constructor(props: AddressLineProps) {
    super(props);
  }

  public static create(value: string): AddressLine {
    const normalized = this.normalize(value);

    this.validate(normalized);

    return new AddressLine({ value: normalized });
  }

  private static normalize(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  public static restore(value: string): AddressLine {
    return new AddressLine({
      value,
    });
  }

  public get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }

  public withValue(value: string): AddressLine {
    return AddressLine.create(value);
  }

  private static validate(value: string): void {
    if (!value) {
      throw new DomainException('Address line is required.', {
        code: 'ADDRESS_LINE_REQUIRED',
      });
    }

    if (value.length < this.MIN_LENGTH) {
      throw new DomainException(
        `Address line must be at least ${this.MIN_LENGTH} characters.`,
        {
          code: 'ADDRESS_LINE_TOO_SHORT',
        },
      );
    }

    if (value.length > this.MAX_LENGTH) {
      throw new DomainException(
        `Address line cannot exceed ${this.MAX_LENGTH} characters.`,
        {
          code: 'ADDRESS_LINE_TOO_LONG',
        },
      );
    }
  }
}
