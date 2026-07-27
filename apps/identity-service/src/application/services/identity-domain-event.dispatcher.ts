import { Injectable, Logger } from '@nestjs/common';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { UserRegisteredEvent } from 'libs/shared/events';
import { EventPublisher } from 'libs/shared/interfaces';
import { IdentityAccount } from '../../domain/entities/identity-account.entity';
import { IdentityRegisteredEvent } from '../../domain/events/identity-registered.event';

@Injectable()
export class IdentityDomainEventDispatcher {
  private readonly logger = new Logger(IdentityDomainEventDispatcher.name);

  constructor(private readonly eventPublisher: EventPublisher) {}

  async dispatch(account: IdentityAccount): Promise<void> {
    const events = account.getDomainEvents();
    if (events.length === 0) {
      return;
    }

    for (const event of events) {
      if (event instanceof IdentityRegisteredEvent) {
        const payload: UserRegisteredEvent = {
          identityId: event.identityId.value,
          email: event.email.value,
          firstName: event.firstName,
          lastName: event.lastName,
          occurredAt: event.occurredAt.toISOString(),
        };
        await this.eventPublisher.publish(EVENT_NAMES.USER_REGISTERED, payload);
        continue;
      }

      this.logger.debug(
        `Domain event ${event.constructor.name} raised for identity ${account.id.value}`,
      );
    }

    account.clearDomainEvents();
  }
}
