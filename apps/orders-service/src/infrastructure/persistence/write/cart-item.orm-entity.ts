import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { CartOrmEntity } from './cart.orm-entity';

@Entity({ name: 'cart_items' })
@Index('idx_cart_items_cart_id', ['cartId'])
@Index('uq_cart_items_product_variant', ['cartId', 'productId', 'variantId'], {
  unique: true,
})
export class CartItemOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId!: string;

  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName!: string;

  @Column({ type: 'varchar', length: 128 })
  sku!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ name: 'unit_price_amount', type: 'bigint' })
  unitPriceAmount!: string;

  @Column({ name: 'unit_price_currency', type: 'varchar', length: 8 })
  unitPriceCurrency!: string;

  @ManyToOne(() => CartOrmEntity, (cart) => cart.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id' })
  cart!: CartOrmEntity;
}
