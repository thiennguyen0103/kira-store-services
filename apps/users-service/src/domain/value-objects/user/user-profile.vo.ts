import { ValueObject } from 'libs/shared/domain/value-object';
import { Avatar } from './avatar.vo';
import { Gender } from './gender.vo';
import { PersonName } from './person-name.vo';
import { PhoneNumber } from './phone-number.vo';
import { BirthDate } from './birth-date.vo';

export interface UserProfileProps {
  name: PersonName;
  phone?: PhoneNumber;
  avatar?: Avatar;
  birthDate?: BirthDate;
  gender?: Gender;
}

export class UserProfile extends ValueObject<UserProfileProps> {
  private constructor(props: UserProfileProps) {
    super(props);
  }

  public static create(props: UserProfileProps): UserProfile {
    return new UserProfile(props);
  }

  public get name(): PersonName {
    return this.props.name;
  }

  public get phone(): PhoneNumber | undefined {
    return this.props.phone;
  }

  public get avatar(): Avatar | undefined {
    return this.props.avatar;
  }

  public get birthDate(): BirthDate | undefined {
    return this.props.birthDate;
  }

  public get gender(): Gender | undefined {
    return this.props.gender;
  }

  public get fullName(): string {
    return this.name.fullName;
  }

  public get age(): number | undefined {
    return this.birthDate?.age;
  }

  public hasAvatar(): boolean {
    return this.avatar !== undefined;
  }

  public isAdult(): boolean {
    return this.birthDate?.isAdult() ?? false;
  }

  public withName(name: PersonName): UserProfile {
    return UserProfile.create({
      ...this.props,
      name,
    });
  }

  public withPhone(phone?: PhoneNumber): UserProfile {
    return UserProfile.create({
      ...this.props,
      phone,
    });
  }

  public withAvatar(avatar?: Avatar): UserProfile {
    return UserProfile.create({
      ...this.props,
      avatar,
    });
  }

  public withBirthDate(birthDate?: BirthDate): UserProfile {
    return UserProfile.create({
      ...this.props,
      birthDate,
    });
  }

  public withGender(gender?: Gender): UserProfile {
    return UserProfile.create({
      ...this.props,
      gender,
    });
  }

  /**
   * Replace the whole profile in one operation.
   */
  public update(props: Partial<UserProfileProps>): UserProfile {
    return UserProfile.create({
      ...this.props,
      ...props,
    });
  }
}
