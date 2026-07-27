export class DeleteAssetCommand {
  constructor(
    public readonly assetId: string,
    public readonly requesterIdentityId: string,
  ) {}
}
