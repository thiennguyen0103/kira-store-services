export class SetBrandActiveCommand {
  constructor(
    public readonly brandId: string,
    public readonly isActive: boolean,
  ) {}
}
