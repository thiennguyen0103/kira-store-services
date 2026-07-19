export class UserListItemDto {
  constructor(
    public readonly id: string,
    public readonly fullName: string,
    public readonly email: string,
    public readonly phoneNumber: string | null,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date,
  ) {}
}
