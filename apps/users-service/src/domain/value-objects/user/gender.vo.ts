import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { EGender } from '../../enums/gender.enum';

interface GenderProps {
  value: EGender;
}

export class Gender extends ValueObject<GenderProps> {
  constructor(props: GenderProps) {
    super(props);
  }

  public static create(value: EGender | string): Gender {
    const normalized = value.toString().trim().toUpperCase();

    if (!Object.values(EGender).includes(normalized as EGender)) {
      throw new DomainException('Invalid gender.', {
        code: 'INVALID_GENDER',
      });
    }

    return new Gender({
      value: normalized as EGender,
    });
  }

  public get value(): EGender {
    return this.props.value;
  }

  public isMale(): boolean {
    return this.props.value === EGender.MALE;
  }

  public isFemale(): boolean {
    return this.props.value === EGender.FEMALE;
  }

  public isOther(): boolean {
    return this.props.value === EGender.OTHER;
  }

  public toString(): string {
    return this.props.value;
  }
}
