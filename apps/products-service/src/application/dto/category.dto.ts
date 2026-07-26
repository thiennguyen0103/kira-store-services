export class CategoryDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly path: string,
    public readonly parentId: string | null,
    public readonly isActive: boolean,
    public readonly depth: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
