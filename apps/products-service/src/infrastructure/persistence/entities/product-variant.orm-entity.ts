import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductOrmEntity } from './product.orm-entity';

@Entity({ name: 'product_variants' })
@Index('idx_product_variants_sku', ['sku'], { unique: true })
@Index('idx_product_variants_product_id', ['productId'])
export class ProductVariantOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku!: string;

  @Column({ type: 'jsonb', default: {} })
  options!: Record<string, string>;

  @Column({ name: 'price_amount', type: 'bigint' })
  priceAmount!: string;

  @Column({ name: 'price_currency', type: 'varchar', length: 8 })
  priceCurrency!: string;

  @Column({ name: 'stock_on_hand', type: 'int' })
  stockOnHand!: number;

  @Column({ name: 'stock_reserved', type: 'int', default: 0 })
  stockReserved!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => ProductOrmEntity, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product!: ProductOrmEntity;
}
