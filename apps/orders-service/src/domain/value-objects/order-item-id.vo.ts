import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class OrderItemId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): OrderItemId {
    const id = value ?? this.generate();
    this.validate(id);
    return new OrderItemId(id);
  }

  public static restore(value: string): OrderItemId {
    this.validate(value);
    return new OrderItemId(value);
  }
}
