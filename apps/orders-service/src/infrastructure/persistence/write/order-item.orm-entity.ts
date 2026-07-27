import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { OrderOrmEntity } from './order.orm-entity';

@Entity({ name: 'order_items' })
@Index('idx_order_items_order_id', ['orderId'])
export class OrderItemOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

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

  @ManyToOne(() => OrderOrmEntity, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order!: OrderOrmEntity;
}
