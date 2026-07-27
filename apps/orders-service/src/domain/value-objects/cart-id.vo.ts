import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class CartId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): CartId {
    const id = value ?? this.generate();
    this.validate(id);
    return new CartId(id);
  }

  public static restore(value: string): CartId {
    this.validate(value);
    return new CartId(value);
  }
}
