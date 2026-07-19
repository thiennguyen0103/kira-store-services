import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class UserId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): UserId {
    const id = value ?? this.generate();

    this.validate(id);

    return new UserId(id);
  }

  public static restore(value: string): UserId {
    this.validate(value);

    return new UserId(value);
  }
}
