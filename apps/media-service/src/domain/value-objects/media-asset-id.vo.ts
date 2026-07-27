import { UniqueId } from 'libs/shared/domain/unique-id.vo';

export class MediaAssetId extends UniqueId {
  private constructor(value: string) {
    super({ value });
  }

  public static create(value?: string): MediaAssetId {
    const id = value ?? this.generate();
    this.validate(id);
    return new MediaAssetId(id);
  }

  public static restore(value: string): MediaAssetId {
    this.validate(value);
    return new MediaAssetId(value);
  }
}
