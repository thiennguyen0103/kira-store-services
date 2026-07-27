import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class CartItemId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): CartItemId {
    const id = value ?? this.generate();
    this.validate(id);
    return new CartItemId(id);
  }

  public static restore(value: string): CartItemId {
    this.validate(value);
    return new CartItemId(value);
  }
}
