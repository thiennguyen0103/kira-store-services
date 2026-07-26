import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from 'apps/users-service/src/domain/entities/user.entity';
import { UserRepository } from 'apps/users-service/src/domain/repositories/user.repository';
import { Avatar } from 'apps/users-service/src/domain/value-objects/user/avatar.vo';
import { BirthDate } from 'apps/users-service/src/domain/value-objects/user/birth-date.vo';
import { Gender } from 'apps/users-service/src/domain/value-objects/user/gender.vo';
import { IdentityId } from 'apps/users-service/src/domain/value-objects/user/identity-id.vo';
import { PersonName } from 'apps/users-service/src/domain/value-objects/user/person-name.vo';
import { PhoneNumber } from 'apps/users-service/src/domain/value-objects/user/phone-number.vo';
import { UserId } from 'apps/users-service/src/domain/value-objects/user/user-id.vo';
import { UserProfile } from 'apps/users-service/src/domain/value-objects/user/user-profile.vo';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly repository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const user = User.create(
      UserId.create(),
      IdentityId.create(command.identityId),
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
        avatar: command.avatarUrl
          ? Avatar.create(command.avatarUrl)
          : undefined,
      }),
    );

    await this.repository.save(user);
  }
}
