import { DomainEvent } from 'libs/shared/domain/domain-event';
import { PaymentId } from '../value-objects/payment-id.vo';

export class PaymentSucceededDomainEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(public readonly paymentId: PaymentId) {}
}
