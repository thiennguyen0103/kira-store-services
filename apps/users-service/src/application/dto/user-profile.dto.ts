export class UserProfileDto {
  constructor(
    public readonly fullName: string,
    public readonly avatarUrl: string | null,
    public readonly phoneNumber: string | null,
    public readonly gender: string | null,
    public readonly birthday: Date | null,
  ) {}
}
