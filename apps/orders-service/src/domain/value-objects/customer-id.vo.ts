import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class CustomerId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): CustomerId {
    const id = value ?? this.generate();
    this.validate(id);
    return new CustomerId(id);
  }

  public static restore(value: string): CustomerId {
    this.validate(value);
    return new CustomerId(value);
  }
}
