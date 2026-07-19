import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import equal from 'fast-deep-equal';

export interface PersonNameProps {
  firstName: string;
  lastName: string;
}

export class PersonName extends ValueObject<PersonNameProps> {
  private static readonly MAX_FIRST_NAME_LENGTH = 100;
  private static readonly MAX_LAST_NAME_LENGTH = 100;

  private constructor(props: PersonNameProps) {
    super(props);
  }

  public static create(props: PersonNameProps): PersonName {
    const firstName = this.normalize(props.firstName);
    const lastName = this.normalize(props.lastName);

    this.validate(firstName, lastName);

    return new PersonName({
      firstName,
      lastName,
    });
  }

  public get firstName(): string {
    return this.props.firstName;
  }

  public get lastName(): string {
    return this.props.lastName;
  }

  public get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  public get initials(): string {
    return (
      this.props.firstName.charAt(0) + this.props.lastName.charAt(0)
    ).toUpperCase();
  }

  public withFirstName(firstName: string): PersonName {
    return PersonName.create({
      firstName,
      lastName: this.lastName,
    });
  }

  public withLastName(lastName: string): PersonName {
    return PersonName.create({
      firstName: this.firstName,
      lastName,
    });
  }

  public withName(firstName: string, lastName: string): PersonName {
    return PersonName.create({
      firstName,
      lastName,
    });
  }

  public equals(other?: PersonName): boolean {
    return equal(this.props, other?.props);
  }

  public toString(): string {
    return this.fullName;
  }

  private static validate(firstName: string, lastName: string): void {
    if (!firstName) {
      throw new DomainException('First name is required.', {
        code: 'FIRST_NAME_REQUIRED',
      });
    }

    if (!lastName) {
      throw new DomainException('Last name is required.', {
        code: 'LAST_NAME_REQUIRED',
      });
    }

    if (firstName.length > this.MAX_FIRST_NAME_LENGTH) {
      throw new DomainException('First name is too long.', {
        code: 'FIRST_NAME_TOO_LONG',
      });
    }

    if (lastName.length > this.MAX_LAST_NAME_LENGTH) {
      throw new DomainException('Last name is too long.', {
        code: 'LAST_NAME_TOO_LONG',
      });
    }

    // Allow any Unicode letters plus spaces, apostrophes and hyphens.
    const pattern = /^[\p{L}][\p{L}\s'-]*$/u;

    if (!pattern.test(firstName)) {
      throw new DomainException('First name contains invalid characters.', {
        code: 'INVALID_FIRST_NAME',
      });
    }

    if (!pattern.test(lastName)) {
      throw new DomainException('Last name contains invalid characters.', {
        code: 'INVALID_LAST_NAME',
      });
    }
  }

  private static normalize(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }
}
