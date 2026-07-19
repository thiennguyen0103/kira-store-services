import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AddressOrmEntity } from './address.entity';

@Entity({ name: 'users' })
@Index('idx_users_identity_id', ['identityId'], {
  unique: true,
})
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'identity_id', type: 'uuid', unique: true })
  identityId!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 2048, nullable: true })
  avatarUrl!: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 32, nullable: true })
  phoneNumber!: string | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  gender!: string | null;

  @Column({ type: 'date', nullable: true })
  birthday!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => AddressOrmEntity, (address) => address.user)
  addresses!: AddressOrmEntity[];
}
