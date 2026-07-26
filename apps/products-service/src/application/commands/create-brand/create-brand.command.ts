export class CreateBrandCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly logoUrl?: string,
  ) {}
}
