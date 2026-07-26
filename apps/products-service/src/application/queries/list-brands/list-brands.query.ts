export class ListBrandsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly activeOnly?: boolean,
  ) {}
}
