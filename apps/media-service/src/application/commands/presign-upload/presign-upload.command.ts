export class PresignUploadCommand {
  constructor(
    public readonly purpose: string,
    public readonly contentType: string,
    public readonly contentLength: number,
    public readonly uploaderIdentityId: string,
    public readonly fileName?: string,
  ) {}
}

export interface PresignUploadResult {
  assetId: string;
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
}
