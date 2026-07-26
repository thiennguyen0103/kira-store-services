import { User } from '../entities/user.entity';
import { IdentityId } from '../value-objects/user/identity-id.vo';
import { UserId } from '../value-objects/user/user-id.vo';
import { Address } from '../entities/address.entity';

export abstract class UserRepository {
  abstract findById(id: UserId): Promise<User | null>;

  abstract findByIdentityId(identityId: IdentityId): Promise<User | null>;

  abstract exists(id: UserId): Promise<boolean>;

  abstract updateAddress(userId: UserId, address: Address): Promise<void>;

  abstract save(user: User): Promise<void>;

  abstract delete(user: User): Promise<void>;
}
