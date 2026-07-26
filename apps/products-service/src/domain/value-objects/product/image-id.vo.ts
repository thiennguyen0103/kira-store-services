import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class ImageId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): ImageId {
    const id = value ?? this.generate();
    this.validate(id);
    return new ImageId(id);
  }

  public static restore(value: string): ImageId {
    this.validate(value);
    return new ImageId(value);
  }
}
