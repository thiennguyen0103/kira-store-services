import { ValueObject } from 'libs/shared/domain/value-object';
import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { InsufficientStockException } from '../../exceptions/insufficient-stock.exception';

export interface StockLevelProps {
  onHand: number;
  reserved: number;
}

export class StockLevel extends ValueObject<StockLevelProps> {
  private constructor(props: StockLevelProps) {
    super(props);
  }

  public static create(onHand: number, reserved = 0): StockLevel {
    this.validate(onHand, reserved);
    return new StockLevel({ onHand, reserved });
  }

  public static restore(onHand: number, reserved: number): StockLevel {
    return new StockLevel({ onHand, reserved });
  }

  public static zero(): StockLevel {
    return new StockLevel({ onHand: 0, reserved: 0 });
  }

  public get onHand(): number {
    return this.props.onHand;
  }

  public get reserved(): number {
    return this.props.reserved;
  }

  public get available(): number {
    return this.props.onHand - this.props.reserved;
  }

  public reserve(qty: number): StockLevel {
    this.assertPositiveQty(qty);

    if (qty > this.available) {
      throw new InsufficientStockException(this.available, qty);
    }

    return new StockLevel({
      onHand: this.props.onHand,
      reserved: this.props.reserved + qty,
    });
  }

  public release(qty: number): StockLevel {
    this.assertPositiveQty(qty);

    if (qty > this.props.reserved) {
      throw new DomainException(
        `Cannot release ${qty} units; only ${this.props.reserved} reserved.`,
        {
          code: 'INVALID_STOCK_RELEASE',
          details: { reserved: this.props.reserved, requested: qty },
        },
      );
    }

    return new StockLevel({
      onHand: this.props.onHand,
      reserved: this.props.reserved - qty,
    });
  }

  public adjustOnHand(delta: number): StockLevel {
    if (!Number.isInteger(delta)) {
      throw new DomainException('Stock adjustment must be an integer.', {
        code: 'INVALID_STOCK_ADJUSTMENT',
      });
    }

    const nextOnHand = this.props.onHand + delta;

    if (nextOnHand < 0) {
      throw new DomainException('On-hand stock cannot be negative.', {
        code: 'NEGATIVE_ON_HAND',
      });
    }

    if (this.props.reserved > nextOnHand) {
      throw new DomainException(
        'On-hand stock cannot be less than reserved quantity.',
        {
          code: 'ON_HAND_BELOW_RESERVED',
          details: {
            onHand: nextOnHand,
            reserved: this.props.reserved,
          },
        },
      );
    }

    return new StockLevel({
      onHand: nextOnHand,
      reserved: this.props.reserved,
    });
  }

  private assertPositiveQty(qty: number): void {
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new DomainException('Quantity must be a positive integer.', {
        code: 'INVALID_QUANTITY',
        details: { qty },
      });
    }
  }

  private static validate(onHand: number, reserved: number): void {
    if (!Number.isInteger(onHand) || onHand < 0) {
      throw new DomainException(
        'On-hand stock must be a non-negative integer.',
        {
          code: 'INVALID_ON_HAND',
        },
      );
    }

    if (!Number.isInteger(reserved) || reserved < 0) {
      throw new DomainException(
        'Reserved stock must be a non-negative integer.',
        {
          code: 'INVALID_RESERVED',
        },
      );
    }

    if (reserved > onHand) {
      throw new DomainException('Reserved stock cannot exceed on-hand stock.', {
        code: 'RESERVED_EXCEEDS_ON_HAND',
      });
    }
  }
}
