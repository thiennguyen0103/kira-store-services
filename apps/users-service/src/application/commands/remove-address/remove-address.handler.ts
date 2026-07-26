import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { RemoveAddressCommand } from './remove-address.command';

@CommandHandler(RemoveAddressCommand)
export class RemoveAddressHandler implements ICommandHandler<RemoveAddressCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: RemoveAddressCommand): Promise<void> {
    const user = await this.repository.findById(UserId.restore(command.userId));

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    user.removeAddress(command.addressId);

    await this.repository.save(user);
  }
}
