import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { ValueObject } from 'libs/shared/domain/value-object';

export interface WardProps {
  code: string;
}

export class Ward extends ValueObject<WardProps> {
  private static readonly MAX_CODE_LENGTH = 20;

  private constructor(props: WardProps) {
    super(props);
  }

  public static create(code: string): Ward {
    const normalized = this.normalize(code);

    this.validate(normalized);

    return new Ward({
      code: normalized,
    });
  }

  public static restore(code: string): Ward {
    return new Ward({
      code,
    });
  }

  public get code(): string {
    return this.props.code;
  }

  public toString(): string {
    return this.props.code;
  }

  private static normalize(value: string): string {
    return value.trim().toUpperCase();
  }

  private static validate(code: string): void {
    if (!code) {
      throw new DomainException('Ward code is required.', {
        code: 'WARD_CODE_REQUIRED',
      });
    }

    if (code.length > this.MAX_CODE_LENGTH) {
      throw new DomainException('Ward code is too long.', {
        code: 'WARD_CODE_TOO_LONG',
      });
    }
  }
}
