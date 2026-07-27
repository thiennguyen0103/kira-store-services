import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { BirthDate } from 'apps/users-service/src/domain/value-objects/user/birth-date.vo';
import { Gender } from 'apps/users-service/src/domain/value-objects/user/gender.vo';
import { PersonName } from 'apps/users-service/src/domain/value-objects/user/person-name.vo';
import { PhoneNumber } from 'apps/users-service/src/domain/value-objects/user/phone-number.vo';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { UpdateProfileCommand } from './update-profile.command';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<void> {
    const user = await this.repository.findById(UserId.restore(command.userId));

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    let profile = user.profile.withName(
      PersonName.create({
        firstName: command.firstName,
        lastName: command.lastName,
      }),
    );

    if (command.phoneNumber !== undefined) {
      profile = profile.withPhone(
        // TODO: get country code from user's country
        PhoneNumber.create(command.phoneNumber, 'VN'),
      );
    }

    if (command.gender !== undefined) {
      profile = profile.withGender(Gender.create(command.gender));
    }

    if (command.birthday !== undefined) {
      profile = profile.withBirthDate(BirthDate.create(command.birthday));
    }

    user.updateProfile(profile);

    await this.repository.save(user);
  }
}
