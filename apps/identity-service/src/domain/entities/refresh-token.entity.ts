import { Entity } from 'libs/shared/domain/entity';
import { IdentityId } from '../value-objects/identity-id.vo';
import { RefreshTokenId } from '../value-objects/refresh-token-id.vo';

export interface RefreshTokenProps {
  identityId: IdentityId;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: RefreshTokenId | null;
  createdAt: Date;
}

export class RefreshToken extends Entity<RefreshTokenId> {
  private constructor(
    id: RefreshTokenId,
    private props: RefreshTokenProps,
  ) {
    super(id);
  }

  public static create(params: {
    id: RefreshTokenId;
    identityId: IdentityId;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
  }): RefreshToken {
    return new RefreshToken(params.id, {
      identityId: params.identityId,
      tokenHash: params.tokenHash,
      familyId: params.familyId,
      expiresAt: params.expiresAt,
      revokedAt: null,
      replacedByTokenId: null,
      createdAt: new Date(),
    });
  }

  public static restore(
    id: RefreshTokenId,
    props: RefreshTokenProps,
  ): RefreshToken {
    return new RefreshToken(id, props);
  }

  get identityId(): IdentityId {
    return this.props.identityId;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get familyId(): string {
    return this.props.familyId;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get revokedAt(): Date | null {
    return this.props.revokedAt;
  }

  get replacedByTokenId(): RefreshTokenId | null {
    return this.props.replacedByTokenId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get isRevoked(): boolean {
    return this.props.revokedAt !== null;
  }

  get isExpired(): boolean {
    return this.props.expiresAt.getTime() <= Date.now();
  }

  get isActive(): boolean {
    return !this.isRevoked && !this.isExpired;
  }

  public revoke(replacedBy?: RefreshTokenId): void {
    this.props.revokedAt = new Date();
    if (replacedBy) {
      this.props.replacedByTokenId = replacedBy;
    }
  }
}
