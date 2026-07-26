import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class BrandId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): BrandId {
    const id = value ?? this.generate();
    this.validate(id);
    return new BrandId(id);
  }

  public static restore(value: string): BrandId {
    this.validate(value);
    return new BrandId(value);
  }
}
