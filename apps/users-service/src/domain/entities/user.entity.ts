import { AggregateRoot } from 'libs/shared/domain/aggregate-root';
import { AddressNotFoundException } from '../exceptions/address-not-found.exception';
import { IdentityId } from '../value-objects/user/identity-id.vo';
import { UserProfile } from '../value-objects/user/user-profile.vo';
import { UserId } from '../value-objects/user/user-id.vo';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserProfileUpdatedEvent } from '../events/user-profile-updated.event';
import { Address } from './address.entity';
import { UserAddressRemovedEvent } from '../events/user-address-removed.event';
import { UserAddressAddedEvent } from '../events/user-address-added.event';
import { DefaultAddressChangedEvent } from '../events/default-address-changed.event';
import { UserAddressUpdatedEvent } from '../events/user-address-updated.event';

export interface UserProps {
  identityId: IdentityId;
  email: string;
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

  public static create(
    id: UserId,
    identityId: IdentityId,
    profile: UserProfile,
    email: string,
  ): User {
    const now = new Date();

    const user = new User(id, {
      identityId,
      email,
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

  get email(): string {
    return this.props.email;
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

  public updateAddress(address: Address): void {
    const index = this.props.addresses.findIndex((x) =>
      x.id.equals(address.id),
    );

    if (index === -1) {
      throw new AddressNotFoundException(address.id.value);
    }

    this.props.addresses[index] = address;

    this.touch();

    this.addDomainEvent(new UserAddressUpdatedEvent(this.id, address.id));
  }

  public removeAddress(addressId: string): void {
    const address = this.props.addresses.find((x) => x.id.value === addressId);

    if (!address) {
      throw new AddressNotFoundException(addressId);
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
      throw new AddressNotFoundException(addressId);
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
