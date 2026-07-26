export class ListProductsQuery {
  constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly status?: string,
    public readonly categoryId?: string,
    public readonly brandId?: string,
    public readonly query?: string,
  ) {}
}
