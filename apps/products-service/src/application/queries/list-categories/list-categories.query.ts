export class ListCategoriesQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly activeOnly?: boolean,
    public readonly parentId?: string | null,
  ) {}
}
