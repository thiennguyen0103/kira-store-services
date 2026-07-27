export abstract class StoragePort {
  /** Ensure bucket exists and is ready for uploads (idempotent). */
  abstract ensureReady(): Promise<void>;

  abstract createPresignedUpload(params: {
    key: string;
    contentType: string;
    contentLength: number;
  }): Promise<{ uploadUrl: string; publicUrl: string; expiresAt: Date }>;

  abstract deleteObject(key: string): Promise<void>;
}
