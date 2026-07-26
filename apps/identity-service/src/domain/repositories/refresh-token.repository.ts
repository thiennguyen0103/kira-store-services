import { RefreshToken } from '../entities/refresh-token.entity';
import { IdentityId } from '../value-objects/identity-id.vo';
import { RefreshTokenId } from '../value-objects/refresh-token-id.vo';

export abstract class RefreshTokenRepository {
  abstract findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;

  abstract findById(id: RefreshTokenId): Promise<RefreshToken | null>;

  abstract save(token: RefreshToken): Promise<void>;

  abstract revokeFamily(familyId: string): Promise<void>;

  abstract revokeAllForIdentity(identityId: IdentityId): Promise<void>;
}
