import { DomainException } from 'libs/shared/exceptions/domain.exception';
import { PaymentStatus } from 'libs/shared/enums';

export class InvalidPaymentStateException extends DomainException {
  constructor(action: string, status: PaymentStatus) {
    super(`Cannot ${action} payment in status ${status}.`, {
      code: 'INVALID_PAYMENT_STATE',
      details: { action, status },
    });
  }
}
