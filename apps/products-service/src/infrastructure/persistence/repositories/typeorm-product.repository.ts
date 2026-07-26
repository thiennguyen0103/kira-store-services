import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'apps/products-service/src/domain/entities/product.entity';
import { ProductRepository } from 'apps/products-service/src/domain/repositories/product.repository';
import { ProductId } from 'apps/products-service/src/domain/value-objects/product/product-id.vo';
import { Sku } from 'apps/products-service/src/domain/value-objects/product/sku.vo';
import { Slug } from 'apps/products-service/src/domain/value-objects/shared/slug.vo';
import { DataSource, Repository } from 'typeorm';
import { ProductImageOrmEntity } from '../entities/product-image.orm-entity';
import { ProductVariantOrmEntity } from '../entities/product-variant.orm-entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductPersistenceMapper } from '../mappers/product-persistence.mapper';

@Injectable()
export class TypeOrmProductRepository extends ProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly products: Repository<ProductOrmEntity>,
    @InjectRepository(ProductVariantOrmEntity)
    private readonly variants: Repository<ProductVariantOrmEntity>,
    @InjectRepository(ProductImageOrmEntity)
    private readonly images: Repository<ProductImageOrmEntity>,
    private readonly mapper: ProductPersistenceMapper,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async findById(id: ProductId): Promise<Product | null> {
    const product = await this.products.findOne({
      where: { id: id.value },
      relations: { variants: true, images: true },
    });
    return product ? this.mapper.toDomain(product) : null;
  }

  async findBySlug(slug: Slug): Promise<Product | null> {
    const product = await this.products.findOne({
      where: { slug: slug.value },
      relations: { variants: true, images: true },
    });
    return product ? this.mapper.toDomain(product) : null;
  }

  async findBySku(sku: Sku): Promise<Product | null> {
    const variant = await this.variants.findOne({
      where: { sku: sku.value },
    });
    if (!variant) {
      return null;
    }
    return this.findById(ProductId.restore(variant.productId));
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    return this.products.existsBy({ slug: slug.value });
  }

  async save(product: Product): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const products = manager.getRepository(ProductOrmEntity);
      const variants = manager.getRepository(ProductVariantOrmEntity);
      const images = manager.getRepository(ProductImageOrmEntity);

      const existing = await products.findOne({
        where: { id: product.id.value },
        relations: { variants: true, images: true },
      });

      await products.save(this.mapper.toProductOrm(product));

      const nextVariantIds = new Set(
        product.variants.map((variant) => variant.id.value),
      );
      const orphanedVariants = (existing?.variants ?? []).filter(
        (variant) => !nextVariantIds.has(variant.id),
      );
      if (orphanedVariants.length > 0) {
        await variants.remove(orphanedVariants);
      }

      const nextImageIds = new Set(
        product.images.map((image) => image.id.value),
      );
      const orphanedImages = (existing?.images ?? []).filter(
        (image) => !nextImageIds.has(image.id),
      );
      if (orphanedImages.length > 0) {
        await images.remove(orphanedImages);
      }

      if (product.variants.length > 0) {
        await variants.save(
          product.variants.map((variant) =>
            this.mapper.toVariantOrm(variant, product.id.value),
          ),
        );
      }

      if (product.images.length > 0) {
        await images.save(
          product.images.map((image) =>
            this.mapper.toImageOrm(image, product.id.value),
          ),
        );
      }
    });
  }
}
