export abstract class VerificationTokenRepository {
  abstract createEmailVerification(params: {
    identityId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;

  abstract findValidEmailVerification(
    tokenHash: string,
  ): Promise<{ identityId: string; id: string } | null>;

  abstract consumeEmailVerification(id: string): Promise<void>;

  abstract createPasswordReset(params: {
    identityId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;

  abstract findValidPasswordReset(
    tokenHash: string,
  ): Promise<{ identityId: string; id: string } | null>;

  abstract consumePasswordReset(id: string): Promise<void>;

  abstract invalidateEmailVerificationsForIdentity(
    identityId: string,
  ): Promise<void>;

  abstract invalidatePasswordResetsForIdentity(
    identityId: string,
  ): Promise<void>;
}
