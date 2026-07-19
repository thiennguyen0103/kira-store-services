import { ValueObject } from 'libs/shared/domain/value-object';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface PhoneNumberProps {
  country: CountryCode;
  number: string;
}

export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  constructor(props: PhoneNumberProps) {
    super(props);
  }

  public static create(
    rawPhone: string,
    defaultCountry: CountryCode,
  ): PhoneNumber {
    const parsed = parsePhoneNumberFromString(rawPhone, defaultCountry);

    if (!parsed) {
      throw new DomainException('Invalid phone number.', {
        code: 'INVALID_PHONE_NUMBER',
      });
    }

    if (!parsed.isValid()) {
      throw new DomainException('Phone number is not valid.', {
        code: 'INVALID_PHONE_NUMBER',
      });
    }

    return new PhoneNumber({
      country: parsed.country!,
      number: parsed.number,
    });
  }

  public get value(): string {
    return this.props.number;
  }

  public get country(): CountryCode {
    return this.props.country;
  }

  public get national(): string {
    const parsed = parsePhoneNumberFromString(this.props.number);

    return parsed?.nationalNumber ?? '';
  }

  public get international(): string {
    const parsed = parsePhoneNumberFromString(this.props.number);

    return parsed?.formatInternational() ?? this.props.number;
  }

  public get masked(): string {
    const national = this.national;

    if (national.length <= 4) {
      return national;
    }

    return (
      national.substring(0, 4) +
      '*'.repeat(Math.max(0, national.length - 6)) +
      national.substring(national.length - 2)
    );
  }

  public equals(other?: PhoneNumber): boolean {
    return !!other && this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
