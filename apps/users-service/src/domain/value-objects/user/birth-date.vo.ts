import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';

export interface BirthDateProps {
  value: Date;
}

export class BirthDate extends ValueObject<BirthDateProps> {
  private static readonly MIN_AGE = 0;
  private static readonly MAX_AGE = 120;

  private constructor(props: BirthDateProps) {
    super(props);
  }

  public static create(date: Date): BirthDate {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new DomainException('Invalid birth date.', {
        code: 'INVALID_BIRTH_DATE',
      });
    }

    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    this.validate(normalized);

    return new BirthDate({
      value: normalized,
    });
  }

  public static restore(date: Date): BirthDate {
    return new BirthDate({
      value: new Date(date),
    });
  }

  public get value(): Date {
    return new Date(this.props.value);
  }

  public get age(): number {
    const today = new Date();

    let age = today.getFullYear() - this.props.value.getFullYear();

    const monthDiff = today.getMonth() - this.props.value.getMonth();

    const dayDiff = today.getDate() - this.props.value.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  public isAdult(minAge = 18): boolean {
    return this.age >= minAge;
  }

  public isBirthday(today = new Date()): boolean {
    return (
      today.getMonth() === this.props.value.getMonth() &&
      today.getDate() === this.props.value.getDate()
    );
  }

  public isOlderThan(years: number): boolean {
    return this.age > years;
  }

  public isYoungerThan(years: number): boolean {
    return this.age < years;
  }

  public withValue(date: Date): BirthDate {
    return BirthDate.create(date);
  }

  public equals(other?: BirthDate): boolean {
    return (
      !!other && this.props.value.getTime() === other.props.value.getTime()
    );
  }

  public toString(): string {
    return this.props.value.toISOString().split('T')[0];
  }

  private static validate(date: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      throw new DomainException('Birth date cannot be in the future.', {
        code: 'BIRTH_DATE_IN_FUTURE',
      });
    }

    const age = this.calculateAge(date, today);

    if (age < this.MIN_AGE) {
      throw new DomainException('Invalid birth date.', {
        code: 'INVALID_BIRTH_DATE',
      });
    }

    if (age > this.MAX_AGE) {
      throw new DomainException('Age exceeds maximum limit.', {
        code: 'AGE_EXCEEDS_LIMIT',
      });
    }
  }

  private static calculateAge(birthDate: Date, today: Date): number {
    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }
}
