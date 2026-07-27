import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { CurrencyCode } from '../enums/currency-code.enum';

export interface MoneyProps {
  amount: number;
  currency: CurrencyCode;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  public static create(amount: number, currency: CurrencyCode): Money {
    if (!Number.isInteger(amount)) {
      throw new DomainException(
        'Money amount must be an integer (minor units).',
        { code: 'INVALID_MONEY_AMOUNT' },
      );
    }

    if (amount < 0) {
      throw new DomainException('Money amount cannot be negative.', {
        code: 'NEGATIVE_MONEY_AMOUNT',
      });
    }

    if (!Object.values(CurrencyCode).includes(currency)) {
      throw new DomainException('Unsupported currency.', {
        code: 'INVALID_CURRENCY',
        details: { currency },
      });
    }

    return new Money({ amount, currency });
  }

  public static restore(amount: number, currency: CurrencyCode): Money {
    return new Money({ amount, currency });
  }

  public get amount(): number {
    return this.props.amount;
  }

  public get currency(): CurrencyCode {
    return this.props.currency;
  }
}
