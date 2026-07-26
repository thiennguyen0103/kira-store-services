import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'apps/products-service/src/domain/entities/brand.entity';
import { BrandRepository } from 'apps/products-service/src/domain/repositories/brand.repository';
import { BrandId } from 'apps/products-service/src/domain/value-objects/brand/brand-id.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { Repository } from 'typeorm';
import { BrandOrmEntity } from '../entities/brand.orm-entity';
import { BrandPersistenceMapper } from '../mappers/brand-persistence.mapper';

@Injectable()
export class TypeOrmBrandRepository extends BrandRepository {
  constructor(
    @InjectRepository(BrandOrmEntity)
    private readonly brands: Repository<BrandOrmEntity>,
    private readonly mapper: BrandPersistenceMapper,
  ) {
    super();
  }

  async save(brand: Brand): Promise<void> {
    await this.brands.save(this.mapper.toOrm(brand));
  }

  async findById(id: BrandId): Promise<Brand | null> {
    const brand = await this.brands.findOne({ where: { id: id.value } });
    return brand ? this.mapper.toDomain(brand) : null;
  }

  async findBySlug(slug: Slug): Promise<Brand | null> {
    const brand = await this.brands.findOne({ where: { slug: slug.value } });
    return brand ? this.mapper.toDomain(brand) : null;
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    return this.brands.existsBy({ slug: slug.value });
  }
}
