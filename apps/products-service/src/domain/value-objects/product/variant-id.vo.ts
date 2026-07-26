import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class VariantId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): VariantId {
    const id = value ?? this.generate();
    this.validate(id);
    return new VariantId(id);
  }

  public static restore(value: string): VariantId {
    this.validate(value);
    return new VariantId(value);
  }
}
