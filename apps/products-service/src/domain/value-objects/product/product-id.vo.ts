import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class ProductId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): ProductId {
    const id = value ?? this.generate();
    this.validate(id);
    return new ProductId(id);
  }

  public static restore(value: string): ProductId {
    this.validate(value);
    return new ProductId(value);
  }
}
