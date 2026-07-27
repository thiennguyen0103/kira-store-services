export class GetAssetQuery {
  constructor(public readonly assetId: string) {}
}

export interface AssetResult {
  assetId: string;
  key: string;
  purpose: string;
  contentType: string;
  contentLength: number;
  publicUrl: string;
  status: string;
  uploaderIdentityId: string;
  createdAt: string;
  updatedAt: string;
}
