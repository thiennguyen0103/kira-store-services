import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  appConfigOptions,
  createTypeOrmRootModule,
  mediaServiceEnvSchema,
} from 'libs/shared/config';
import { createLoggerModule } from 'libs/shared/logging';
import { DeleteAssetHandler } from './application/commands/delete-asset/delete-asset.handler';
import { PresignUploadHandler } from './application/commands/presign-upload/presign-upload.handler';
import { StoragePort } from './application/ports/storage.port';
import { GetAssetHandler } from './application/queries/get-asset/get-asset.handler';
import { MediaAssetRepository } from './domain/repositories/media-asset.repository';
import { MediaAssetOrmEntity } from './infrastructure/persistence/entities/media-asset.orm-entity';
import { MediaAssetPersistenceMapper } from './infrastructure/persistence/mappers/media-asset-persistence.mapper';
import { TypeOrmMediaAssetRepository } from './infrastructure/persistence/repositories/typeorm-media-asset.repository';
import { S3CompatibleStorageAdapter } from './infrastructure/storage/s3-compatible.storage.adapter';
import { MediaGrpcController } from './presentation/media.grpc.controller';

@Module({
  imports: [
    ConfigModule.forRoot(
      appConfigOptions('media-service', mediaServiceEnvSchema),
    ),
    createLoggerModule('media-service'),
    createTypeOrmRootModule(),
    TypeOrmModule.forFeature([MediaAssetOrmEntity]),
    CqrsModule.forRoot(),
  ],
  controllers: [MediaGrpcController],
  providers: [
    PresignUploadHandler,
    DeleteAssetHandler,
    GetAssetHandler,
    MediaAssetPersistenceMapper,
    { provide: MediaAssetRepository, useClass: TypeOrmMediaAssetRepository },
    { provide: StoragePort, useClass: S3CompatibleStorageAdapter },
  ],
})
export class MediaServiceModule {}
