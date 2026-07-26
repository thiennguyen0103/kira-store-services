export class CreateUserCommand {
  constructor(
    public readonly identityId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phoneNumber?: string,
    public readonly gender?: string,
    public readonly birthday?: Date,
    public readonly avatarUrl?: string,
  ) {}
}
