import { NotFoundException } from 'libs/shared/exceptions/not-found.exception';

export class PaymentNotFoundException extends NotFoundException {
  constructor(identifier?: string) {
    super('Payment', identifier);
  }
}
