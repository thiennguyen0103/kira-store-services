export class UpdateBrandCommand {
  constructor(
    public readonly brandId: string,
    public readonly name?: string,
    public readonly logoUrl?: string,
    public readonly clearLogo?: boolean,
  ) {}
}
