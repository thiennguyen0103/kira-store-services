import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'media_assets' })
@Index('idx_media_assets_uploader', ['uploaderIdentityId'])
@Index('idx_media_assets_key', ['key'], { unique: true })
export class MediaAssetOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 512 })
  key!: string;

  @Column({ type: 'varchar', length: 32 })
  purpose!: string;

  @Column({ name: 'content_type', type: 'varchar', length: 128 })
  contentType!: string;

  @Column({ name: 'content_length', type: 'bigint' })
  contentLength!: string;

  @Column({ name: 'public_url', type: 'varchar', length: 2048 })
  publicUrl!: string;

  @Column({ name: 'uploader_identity_id', type: 'uuid' })
  uploaderIdentityId!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
