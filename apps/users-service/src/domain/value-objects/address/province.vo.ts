import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { ValueObject } from 'libs/shared/domain/value-object';

export interface ProvinceProps {
  code: string;
}

export class Province extends ValueObject<ProvinceProps> {
  private static readonly MAX_CODE_LENGTH = 20;

  private constructor(props: ProvinceProps) {
    super(props);
  }

  public static create(code: string): Province {
    const normalized = this.normalize(code);

    this.validate(normalized);

    return new Province({
      code: normalized,
    });
  }

  public static restore(code: string): Province {
    return new Province({
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
      throw new DomainException('Province code is required.', {
        code: 'PROVINCE_CODE_REQUIRED',
      });
    }

    if (code.length > this.MAX_CODE_LENGTH) {
      throw new DomainException('Province code is too long.', {
        code: 'PROVINCE_CODE_TOO_LONG',
      });
    }
  }
}
