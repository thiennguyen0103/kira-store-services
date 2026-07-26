import { DomainException } from 'libs/shared/exceptions/domain.exception';

export class InsufficientStockException extends DomainException {
  constructor(available: number, requested: number) {
    super(
      `Insufficient stock: available ${available}, requested ${requested}.`,
      {
        code: 'INSUFFICIENT_STOCK',
        details: { available, requested },
      },
    );
  }
}
