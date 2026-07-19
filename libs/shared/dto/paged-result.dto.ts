export class PagedResultDto<T> {
  constructor(
    public readonly items: readonly T[],
    public readonly total: number,
    public readonly page: number,
    public readonly limit: number,
  ) {}

  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  get hasNext(): boolean {
    return this.page < this.totalPages;
  }

  get hasPrevious(): boolean {
    return this.page > 1;
  }
}
