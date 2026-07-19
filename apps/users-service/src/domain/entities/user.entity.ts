import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { IdentityId } from '../value-objects/user/identity-id.vo';
import { UserProfile } from '../value-objects/user/user-profile.vo';
import { UserId } from '../value-objects/user/user-id.vo';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';
import { Address } from './address.entity';
import { UserAddressRemovedEvent } from '../events/user-address-removed.event';
import { UserAddressAddedEvent } from '../events/user-address-added.event';
import { DefaultAddressChangedEvent } from '../events/default-address-changed.event';

export interface UserProps {
  identityId: IdentityId;
  profile: UserProfile;
  addresses: Address[];
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
      addresses: [],
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

  get addresses(): readonly Address[] {
    return this.props.addresses;
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

  public addAddress(address: Address): void {
    if (address.isDefault) {
      this.clearDefaultAddress();
    }

    this.props.addresses.push(address);

    this.touch();

    this.addDomainEvent(new UserAddressAddedEvent(this.id, address.id));
  }

  public removeAddress(addressId: string): void {
    const address = this.props.addresses.find((x) => x.id.value === addressId);

    if (!address) {
      throw new Error('Address not found.');
    }

    this.props.addresses = this.props.addresses.filter(
      (x) => !x.id.equals(address.id),
    );

    this.touch();

    this.addDomainEvent(new UserAddressRemovedEvent(this.id, address.id));
  }

  public setDefaultAddress(addressId: string): void {
    const address = this.props.addresses.find((x) => x.id.value === addressId);

    if (!address) {
      throw new Error('Address not found.');
    }

    this.clearDefaultAddress();

    address.makeDefault();

    this.touch();

    this.addDomainEvent(new DefaultAddressChangedEvent(this.id, address.id));
  }

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  private clearDefaultAddress(): void {
    this.props.addresses.forEach((address) => address.unsetDefault());
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
