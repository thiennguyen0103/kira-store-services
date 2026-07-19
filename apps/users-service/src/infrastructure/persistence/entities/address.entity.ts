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
import { UserOrmEntity } from './user.entity';

@Entity({ name: 'addresses' })
@Index('idx_addresses_user_id', ['user'])
@Index('idx_addresses_default', ['user', 'isDefault'])
export class AddressOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserOrmEntity;

  @Column({ name: 'receiver_name', type: 'varchar', length: 255 })
  receiverName!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 32 })
  phoneNumber!: string;

  @Column({ name: 'province_code', type: 'varchar', length: 32 })
  provinceCode!: string;

  @Column({ name: 'district_code', type: 'varchar', length: 32 })
  districtCode!: string;

  @Column({ name: 'ward_code', type: 'varchar', length: 32 })
  wardCode!: string;

  @Column({ name: 'address_line', type: 'varchar', length: 500 })
  addressLine!: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 32 })
  postalCode!: string;

  @Column({ type: 'varchar', length: 32 })
  label!: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
