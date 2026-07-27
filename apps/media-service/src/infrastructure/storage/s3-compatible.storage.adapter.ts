import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StoragePort } from '../../application/ports/storage.port';

@Injectable()
export class S3CompatibleStorageAdapter
  extends StoragePort
  implements OnModuleInit
{
  private readonly logger = new Logger(S3CompatibleStorageAdapter.name);
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private readonly presignTtlSeconds: number;
  private readonly opsClient: S3Client;
  private readonly presignClient: S3Client;

  constructor(config: ConfigService) {
    super();
    this.bucket = config.getOrThrow<string>('S3_BUCKET');
    this.publicBaseUrl = config
      .getOrThrow<string>('S3_PUBLIC_BASE_URL')
      .replace(/\/$/, '');
    this.presignTtlSeconds =
      config.get<number>('S3_PRESIGN_TTL_SECONDS') ?? 300;

    const region = config.get<string>('S3_REGION') ?? 'us-east-1';
    const accessKeyId = config.getOrThrow<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = config.getOrThrow<string>('S3_SECRET_ACCESS_KEY');
    const forcePathStyle = config.get<boolean>('S3_FORCE_PATH_STYLE') ?? true;
    const endpoint = config.getOrThrow<string>('S3_ENDPOINT');
    const presignEndpoint =
      config.get<string>('S3_PRESIGN_ENDPOINT') ?? endpoint;

    const credentials = { accessKeyId, secretAccessKey };

    this.opsClient = new S3Client({
      region,
      endpoint,
      forcePathStyle,
      credentials,
    });

    this.presignClient =
      presignEndpoint === endpoint
        ? this.opsClient
        : new S3Client({
            region,
            endpoint: presignEndpoint,
            forcePathStyle,
            credentials,
          });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureReady();
  }

  async ensureReady(): Promise<void> {
    const maxAttempts = 30;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.ensureBucket();
        this.logger.log(`Storage bucket "${this.bucket}" is ready`);
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        this.logger.warn(
          `Waiting for object storage (attempt ${attempt}/${maxAttempts})...`,
        );
        await sleep(1000);
      }
    }
  }

  async createPresignedUpload(params: {
    key: string;
    contentType: string;
    contentLength: number;
  }): Promise<{ uploadUrl: string; publicUrl: string; expiresAt: Date }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
      ContentLength: params.contentLength,
    });

    const uploadUrl = await getSignedUrl(this.presignClient, command, {
      expiresIn: this.presignTtlSeconds,
    });
    const expiresAt = new Date(Date.now() + this.presignTtlSeconds * 1000);

    return {
      uploadUrl,
      publicUrl: `${this.publicBaseUrl}/${params.key}`,
      expiresAt,
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.opsClient.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.opsClient.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      await this.opsClient.send(
        new CreateBucketCommand({ Bucket: this.bucket }),
      );
    }

    // Public-read objects so product/avatar URLs work without signed GET.
    await this.opsClient.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        }),
      }),
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
