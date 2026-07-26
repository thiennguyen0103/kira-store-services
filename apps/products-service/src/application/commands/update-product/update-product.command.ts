export class UpdateProductCommand {
  constructor(
    public readonly productId: string,
    public readonly name?: string,
    public readonly slug?: string,
    public readonly description?: string,
    public readonly categoryId?: string,
    public readonly brandId?: string,
    public readonly clearDescription?: boolean,
    public readonly clearBrand?: boolean,
  ) {}
}
