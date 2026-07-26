export interface SetProductImageInput {
  url: string;
  alt?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export class SetProductImagesCommand {
  constructor(
    public readonly productId: string,
    public readonly images: SetProductImageInput[],
  ) {}
}
