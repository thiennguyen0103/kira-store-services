import { DomainEvent } from 'libs/shared/domain/domain-event';
import { OrderId } from '../value-objects/order-id.vo';

export class OrderPaymentPendingEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly orderId: OrderId,
    public readonly paymentId?: string,
    public readonly paymentUrl?: string,
  ) {}
}
