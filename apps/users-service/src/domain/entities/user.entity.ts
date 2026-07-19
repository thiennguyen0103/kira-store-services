import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { IdentityId } from '../value-objects/user/identity-id.vo';
import { UserProfile } from '../value-objects/user/user-profile.vo';
import { UserId } from '../value-objects/user/user-id.vo';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';

export interface UserProps {
  identityId: IdentityId;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot<UserId> {
  constructor(
    id: UserId,
    private props: UserProps,
  ) {
    super(id);
  }

  // ------------------------------------------------------------------
  // Factory
  // ------------------------------------------------------------------

  private static create(
    id: UserId,
    identityId: IdentityId,
    profile: UserProfile,
  ): User {
    const now = new Date();

    const user = new User(id, {
      identityId,
      profile,
      createdAt: now,
      updatedAt: now,
    });

    user.addDomainEvent(new UserCreatedEvent(user.id, identityId));

    return user;
  }

  /**
   * Used by repository when loading from database.
   */
  public static restore(id: UserId, props: UserProps): User {
    return new User(id, props);
  }

  // ------------------------------------------------------------------
  // Getters
  // ------------------------------------------------------------------
  get identityId(): IdentityId {
    return this.props.identityId;
  }

  get profile(): UserProfile {
    return this.props.profile;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ------------------------------------------------------------------
  // Business Methods
  // ------------------------------------------------------------------
  public updateProfile(profile: UserProfile): void {
    this.props.profile = profile;

    this.touch();

    this.addDomainEvent(new UserProfileUpdatedEvent(this.id));
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
