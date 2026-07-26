import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { SetDefaultAddressCommand } from './set-default-address.command';

@CommandHandler(SetDefaultAddressCommand)
export class SetDefaultAddressHandler implements ICommandHandler<SetDefaultAddressCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: SetDefaultAddressCommand): Promise<void> {
    const user = await this.repository.findById(UserId.restore(command.userId));

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    user.setDefaultAddress(command.addressId);

    await this.repository.save(user);
  }
}
