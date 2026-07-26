import { DomainException } from 'libs/shared/exceptions/domain.exception';

export class InvalidCategoryException extends DomainException {
  constructor(
    message = 'Invalid category.',
    details?: Record<string, unknown>,
  ) {
    super(message, {
      code: 'INVALID_CATEGORY',
      details,
    });
  }
}
