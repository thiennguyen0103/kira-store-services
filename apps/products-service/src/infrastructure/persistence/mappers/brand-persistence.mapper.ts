import { Injectable } from '@nestjs/common';
import { BrandDto } from 'apps/products-service/src/application/dto/brand.dto';
import { Brand } from 'apps/products-service/src/domain/entities/brand.entity';
import { BrandId } from 'apps/products-service/src/domain/value-objects/brand/brand-id.vo';
import { BrandName } from 'apps/products-service/src/domain/value-objects/brand/brand-name.vo';
import { ImageUrl } from 'apps/products-service/src/domain/value-objects/shared/image-url.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { BrandOrmEntity } from '../entities/brand.orm-entity';

@Injectable()
export class BrandPersistenceMapper {
  toDto(brand: BrandOrmEntity): BrandDto {
    return new BrandDto(
      brand.id,
      brand.name,
      brand.slug,
      brand.logoUrl,
      brand.isActive,
      brand.createdAt,
      brand.updatedAt,
    );
  }

  toDomain(brand: BrandOrmEntity): Brand {
    return Brand.restore(BrandId.restore(brand.id), {
      name: BrandName.restore(brand.name),
      slug: Slug.restore(brand.slug),
      logoUrl: brand.logoUrl ? ImageUrl.restore(brand.logoUrl) : undefined,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    });
  }

  toOrm(brand: Brand): BrandOrmEntity {
    const orm = new BrandOrmEntity();
    orm.id = brand.id.value;
    orm.name = brand.name.value;
    orm.slug = brand.slug.value;
    orm.logoUrl = brand.logoUrl?.value ?? null;
    orm.isActive = brand.isActive;
    orm.createdAt = brand.createdAt;
    orm.updatedAt = brand.updatedAt;
    return orm;
  }
}
