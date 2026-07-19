import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface DistrictProps {
  name: string;
  code: string;
}

export class District extends ValueObject<DistrictProps> {
  private static readonly MAX_CODE_LENGTH = 20;
  private static readonly MAX_NAME_LENGTH = 100;

  constructor(props: DistrictProps) {
    super(props);
  }

  public static create(props: DistrictProps): District {
    const code = props.code.trim();
    const name = this.normalize(props.name);

    this.validate(code, name);

    return new District({
      code,
      name,
    });
  }

  public static restore(props: DistrictProps): District {
    return new District(props);
  }

  public get code(): string {
    return this.props.code;
  }

  public get name(): string {
    return this.props.name;
  }

  public toString(): string {
    return this.props.name;
  }

  private static normalize(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  private static validate(code: string, name: string): void {
    if (!code) {
      throw new DomainException('District code is required.', {
        code: 'DISTRICT_CODE_REQUIRED',
      });
    }

    if (!name) {
      throw new DomainException('District name is required.', {
        code: 'DISTRICT_NAME_REQUIRED',
      });
    }

    if (code.length > this.MAX_CODE_LENGTH) {
      throw new DomainException('District code is too long.', {
        code: 'DISTRICT_CODE_TOO_LONG',
      });
    }

    if (name.length > this.MAX_NAME_LENGTH) {
      throw new DomainException('District name is too long.', {
        code: 'DISTRICT_NAME_TOO_LONG',
      });
    }
  }
}
