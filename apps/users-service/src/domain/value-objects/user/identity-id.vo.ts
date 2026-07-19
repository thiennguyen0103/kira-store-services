import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class IdentityId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): IdentityId {
    const id = value ?? this.generate();

    this.validate(id);

    return new IdentityId(id);
  }

  public static restore(value: string): IdentityId {
    this.validate(value);

    return new IdentityId(value);
  }
}
