import { DomainException } from 'libs/shared/exceptions/domain.exception';

export class ProductCannotPublishException extends DomainException {
  constructor(message: string) {
    super(message, {
      code: 'PRODUCT_CANNOT_PUBLISH',
    });
  }
}
