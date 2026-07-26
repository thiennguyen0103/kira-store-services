export class SetCategoryActiveCommand {
  constructor(
    public readonly categoryId: string,
    public readonly isActive: boolean,
  ) {}
}
