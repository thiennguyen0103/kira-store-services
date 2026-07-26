export abstract class EmailPort {
  abstract sendEmailVerification(params: {
    to: string;
    firstName: string;
    verifyUrl: string;
  }): Promise<void>;

  abstract sendPasswordReset(params: {
    to: string;
    firstName: string;
    resetUrl: string;
  }): Promise<void>;
}
