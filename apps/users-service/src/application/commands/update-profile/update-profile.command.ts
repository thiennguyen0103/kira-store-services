export class UpdateProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phoneNumber?: string,
    public readonly gender?: string,
    public readonly birthday?: Date,
  ) {}
}
