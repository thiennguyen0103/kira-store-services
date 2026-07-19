import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class AddressId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value: string): AddressId {
    const id = value ?? this.generate();

    this.validate(id);

    return new AddressId(id);
  }

  public static restore(value: string): AddressId {
    this.validate(value);

    return new AddressId(value);
  }
}
