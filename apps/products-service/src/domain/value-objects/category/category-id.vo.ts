import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class CategoryId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): CategoryId {
    const id = value ?? this.generate();
    this.validate(id);
    return new CategoryId(id);
  }

  public static restore(value: string): CategoryId {
    this.validate(value);
    return new CategoryId(value);
  }
}
