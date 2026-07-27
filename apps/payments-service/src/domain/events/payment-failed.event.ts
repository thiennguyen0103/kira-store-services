import { DomainEvent } from 'libs/shared/domain/domain-event';
import { PaymentId } from '../value-objects/payment-id.vo';

export class PaymentFailedDomainEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly paymentId: PaymentId,
    public readonly reason?: string,
  ) {}
}
