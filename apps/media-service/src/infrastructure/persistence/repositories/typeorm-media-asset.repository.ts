import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaAsset } from '../../../domain/entities/media-asset.entity';
import { MediaAssetRepository } from '../../../domain/repositories/media-asset.repository';
import { MediaAssetId } from '../../../domain/value-objects/media-asset-id.vo';
import { MediaAssetOrmEntity } from '../entities/media-asset.orm-entity';
import { MediaAssetPersistenceMapper } from '../mappers/media-asset-persistence.mapper';

@Injectable()
export class TypeOrmMediaAssetRepository extends MediaAssetRepository {
  constructor(
    @InjectRepository(MediaAssetOrmEntity)
    private readonly assets: Repository<MediaAssetOrmEntity>,
    private readonly mapper: MediaAssetPersistenceMapper,
  ) {
    super();
  }

  async findById(id: MediaAssetId): Promise<MediaAsset | null> {
    const orm = await this.assets.findOne({ where: { id: id.value } });
    return orm ? this.mapper.toDomain(orm) : null;
  }

  async save(asset: MediaAsset): Promise<void> {
    await this.assets.save(this.mapper.toOrm(asset));
  }
}
