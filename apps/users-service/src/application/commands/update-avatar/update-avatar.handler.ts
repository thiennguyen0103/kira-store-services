import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { Avatar } from 'apps/users-service/src/domain/value-objects/user/avatar.vo';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { UpdateAvatarCommand } from './update-avatar.command';

@CommandHandler(UpdateAvatarCommand)
export class UpdateAvatarHandler implements ICommandHandler<UpdateAvatarCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: UpdateAvatarCommand): Promise<void> {
    const user = await this.repository.findById(UserId.restore(command.userId));

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    user.updateProfile(
      user.profile.withAvatar(Avatar.create(command.avatarUrl)),
    );

    await this.repository.save(user);
  }
}
