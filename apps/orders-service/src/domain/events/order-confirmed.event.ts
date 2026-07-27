import { DomainEvent } from 'libs/shared/domain/domain-event';
import { OrderId } from '../value-objects/order-id.vo';

export class OrderConfirmedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(public readonly orderId: OrderId) {}
}
