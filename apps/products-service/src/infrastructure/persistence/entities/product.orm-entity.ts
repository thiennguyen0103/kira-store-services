import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductImageOrmEntity } from './product-image.orm-entity';
import { ProductVariantOrmEntity } from './product-variant.orm-entity';

@Entity({ name: 'products' })
@Index('idx_products_slug', ['slug'], { unique: true })
@Index('idx_products_category_id', ['categoryId'])
@Index('idx_products_brand_id', ['brandId'])
@Index('idx_products_status', ['status'])
export class ProductOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId!: string;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ProductVariantOrmEntity, (variant) => variant.product)
  variants!: ProductVariantOrmEntity[];

  @OneToMany(() => ProductImageOrmEntity, (image) => image.product)
  images!: ProductImageOrmEntity[];
}
