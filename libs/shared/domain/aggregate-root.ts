import { Entity } from './entity';
import { UniqueId } from './unique-id.vo';
import { DomainEvent } from './domain-event';

export abstract class AggregateRoot<TId extends UniqueId> extends Entity<TId> {
  private readonly domainEvents: DomainEvent[] = [];

  protected constructor(id: TId) {
    super(id);
  }

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): readonly DomainEvent[] {
    return [...this.domainEvents];
  }

  public clearDomainEvents(): void {
    this.domainEvents.length = 0;
  }

  public hasDomainEvents(): boolean {
    return this.domainEvents.length > 0;
  }
}
