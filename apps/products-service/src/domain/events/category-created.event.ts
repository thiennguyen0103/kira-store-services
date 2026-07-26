import { DomainEvent } from 'libs/shared/domain/domain-event';
import { CategoryId } from '../value-objects/category/category-id.vo';

export class CategoryCreatedEvent implements DomainEvent {
  readonly occurredAt = new Date();

  constructor(public readonly categoryId: CategoryId) {}
}
