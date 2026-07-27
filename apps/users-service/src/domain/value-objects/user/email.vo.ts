import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { ValueObject } from 'libs/shared/domain/value-object';

export interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(raw: string): Email {
    const value = raw.trim().toLowerCase();

    if (!value || value.length > 320) {
      throw new DomainException('Invalid email address.', {
        code: 'INVALID_EMAIL',
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new DomainException('Invalid email address.', {
        code: 'INVALID_EMAIL',
      });
    }

    return new Email({ value });
  }

  public static restore(value: string): Email {
    return new Email({ value });
  }

  public get value(): string {
    return this.props.value;
  }
}
