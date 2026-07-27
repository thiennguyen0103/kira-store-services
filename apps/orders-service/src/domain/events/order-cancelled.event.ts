import { DomainEvent } from 'libs/shared/domain/domain-event';
import { OrderId } from '../value-objects/order-id.vo';

export class OrderCancelledEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(
    public readonly orderId: OrderId,
    public readonly reason?: string,
  ) {}
}
