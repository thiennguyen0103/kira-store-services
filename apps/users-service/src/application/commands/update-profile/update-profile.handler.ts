import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserNotFoundException } from 'apps/users-service/src/domain/exceptions/user-not-found.exception';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { UserProfile } from 'apps/users-service/src/domain/value-objects/user/user-profile.vo';
import { UpdateProfileCommand } from './update-profile.command';
import { PersonName } from 'apps/users-service/src/domain/value-objects/user/person-name.vo';
import { Gender } from 'apps/users-service/src/domain/value-objects/user/gender.vo';
import { PhoneNumber } from 'apps/users-service/src/domain/value-objects/user/phone-number.vo';
import { BirthDate } from 'apps/users-service/src/domain/value-objects/user/birth-date.vo';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: UpdateProfileCommand): Promise<void> {
    const user = await this.repository.findById(UserId.restore(command.userId));

    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    user.updateProfile(
      UserProfile.create({
        name: PersonName.create({
          firstName: command.firstName,
          lastName: command.lastName,
        }),
        phone: command.phoneNumber
          ? // TODO: get country code from user's country
            PhoneNumber.create(command.phoneNumber, 'VN')
          : undefined,
        gender: command.gender ? Gender.create(command.gender) : undefined,
        birthDate: command.birthday
          ? BirthDate.create(command.birthday)
          : undefined,
        avatar: user.profile.avatar,
      }),
    );

    await this.repository.save(user);
  }
}
