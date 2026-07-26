import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class RefreshTokenId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): RefreshTokenId {
    const id = value ?? this.generate();
    this.validate(id);
    return new RefreshTokenId(id);
  }

  public static restore(value: string): RefreshTokenId {
    this.validate(value);
    return new RefreshTokenId(value);
  }
}
