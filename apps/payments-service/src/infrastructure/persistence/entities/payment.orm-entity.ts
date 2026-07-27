import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentProvider, PaymentStatus } from 'libs/shared/enums';

@Entity({ name: 'payments' })
@Index('idx_payments_order_id', ['orderId'])
@Index('idx_payments_provider_payment_id', ['providerPaymentId'], {
  unique: true,
})
export class PaymentOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'varchar', length: 64 })
  orderId!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 32 })
  provider!: PaymentProvider;

  @Column({
    name: 'provider_payment_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  providerPaymentId!: string | null;

  @Column({ name: 'amount_minor', type: 'bigint' })
  amountMinor!: string;

  @Column({ type: 'varchar', length: 8 })
  currency!: string;

  @Column({
    name: 'checkout_url',
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  checkoutUrl!: string | null;

  @Column({ name: 'customer_id', type: 'varchar', length: 128, nullable: true })
  customerId!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  description!: string | null;

  @Column({
    name: 'failure_reason',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  failureReason!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
