import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class OrderId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): OrderId {
    const id = value ?? this.generate();
    this.validate(id);
    return new OrderId(id);
  }

  public static restore(value: string): OrderId {
    this.validate(value);
    return new OrderId(value);
  }
}
