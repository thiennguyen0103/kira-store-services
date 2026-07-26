import { IdentityAccount } from '../entities/identity-account.entity';
import { Email } from '../value-objects/email.vo';
import { IdentityId } from '../value-objects/identity-id.vo';

export abstract class IdentityRepository {
  abstract findById(id: IdentityId): Promise<IdentityAccount | null>;

  abstract findByEmail(email: Email): Promise<IdentityAccount | null>;

  abstract existsByEmail(email: Email): Promise<boolean>;

  abstract save(account: IdentityAccount): Promise<void>;
}
