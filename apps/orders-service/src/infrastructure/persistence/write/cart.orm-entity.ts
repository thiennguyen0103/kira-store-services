import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItemOrmEntity } from './cart-item.orm-entity';

@Entity({ name: 'carts' })
@Index('idx_carts_customer_id', ['customerId'], { unique: true })
export class CartOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id', type: 'uuid', unique: true })
  customerId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => CartItemOrmEntity, (item) => item.cart)
  items!: CartItemOrmEntity[];
}
