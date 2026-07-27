import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EVENT_NAMES } from 'libs/shared/constants';
import type { UserRegisteredEvent } from 'libs/shared/events';
import { CreateUserCommand } from '../../application/commands/create-user/create-user.command';
import { UserRepository } from '../../domain/repositories/user.repository';
import { IdentityId } from '../../domain/value-objects/user/identity-id.vo';

@Controller()
export class UserRegisteredConsumer {
  private readonly logger = new Logger(UserRegisteredConsumer.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly users: UserRepository,
  ) {}

  @EventPattern(EVENT_NAMES.USER_REGISTERED)
  async handle(@Payload() event: UserRegisteredEvent): Promise<void> {
    if (
      !event?.identityId ||
      !event.email ||
      !event.firstName ||
      !event.lastName
    ) {
      this.logger.warn('Ignoring malformed user.registered event');
      return;
    }

    const existing = await this.users.findByIdentityId(
      IdentityId.restore(event.identityId),
    );
    if (existing) {
      this.logger.log(
        `User already exists for identity ${event.identityId}; skipping`,
      );
      return;
    }

    await this.commandBus.execute(
      new CreateUserCommand(
        event.identityId,
        event.email,
        event.firstName,
        event.lastName,
      ),
    );

    this.logger.log(`Created user profile for identity ${event.identityId}`);
  }
}
