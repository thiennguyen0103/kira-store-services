import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { ValueObject } from 'libs/shared/domain/value-object';

export interface PasswordProps {
  value: string;
}

/**
 * Plain password for validation only — never persist.
 */
export class Password extends ValueObject<PasswordProps> {
  private constructor(props: PasswordProps) {
    super(props);
  }

  public static create(raw: string): Password {
    if (raw.length < 8 || raw.length > 128) {
      throw new DomainException(
        'Password must be between 8 and 128 characters.',
        { code: 'INVALID_PASSWORD' },
      );
    }

    if (!/[A-Za-z]/.test(raw) || !/[0-9]/.test(raw)) {
      throw new DomainException(
        'Password must contain at least one letter and one number.',
        { code: 'INVALID_PASSWORD' },
      );
    }

    return new Password({ value: raw });
  }

  public get value(): string {
    return this.props.value;
  }
}
