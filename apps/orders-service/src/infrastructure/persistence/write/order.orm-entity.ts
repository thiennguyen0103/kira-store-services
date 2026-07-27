import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItemOrmEntity } from './order-item.orm-entity';

@Entity({ name: 'orders' })
@Index('idx_orders_customer_id', ['customerId'])
@Index('idx_orders_status', ['status'])
export class OrderOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @Column({ name: 'shipping_address_id', type: 'uuid' })
  shippingAddressId!: string;

  @Column({ name: 'shipping_receiver_name', type: 'varchar', length: 255 })
  shippingReceiverName!: string;

  @Column({ name: 'shipping_phone_number', type: 'varchar', length: 32 })
  shippingPhoneNumber!: string;

  @Column({ name: 'shipping_province_code', type: 'varchar', length: 32 })
  shippingProvinceCode!: string;

  @Column({ name: 'shipping_district_code', type: 'varchar', length: 32 })
  shippingDistrictCode!: string;

  @Column({ name: 'shipping_ward_code', type: 'varchar', length: 32 })
  shippingWardCode!: string;

  @Column({ name: 'shipping_address_line', type: 'varchar', length: 512 })
  shippingAddressLine!: string;

  @Column({ name: 'shipping_postal_code', type: 'varchar', length: 32 })
  shippingPostalCode!: string;

  @Column({ name: 'total_amount', type: 'bigint' })
  totalAmount!: string;

  @Column({ name: 'total_currency', type: 'varchar', length: 8 })
  totalCurrency!: string;

  @Column({ name: 'payment_provider', type: 'varchar', length: 32 })
  paymentProvider!: string;

  @Column({ name: 'payment_id', type: 'varchar', length: 128, nullable: true })
  paymentId!: string | null;

  @Column({ name: 'payment_url', type: 'text', nullable: true })
  paymentUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt!: Date | null;

  @OneToMany(() => OrderItemOrmEntity, (item) => item.order)
  items!: OrderItemOrmEntity[];
}
