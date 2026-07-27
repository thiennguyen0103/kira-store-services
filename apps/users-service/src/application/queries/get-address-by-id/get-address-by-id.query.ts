export class GetAddressByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly addressId: string,
  ) {}
}
