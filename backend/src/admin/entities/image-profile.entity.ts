import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export type ImageProfileStatus =
  'draft' | 'processing' | 'active' | 'archived' | 'failed';
export type ImageProfileItemStatus =
  'pending' | 'ready' | 'duplicate' | 'rejected' | 'failed';

export type ImageProfileItem = {
  id: string;
  objectKey: string;
  thumbnailKey?: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  checksum?: string;
  qualityScore?: number;
  status: ImageProfileItemStatus;
  error?: string;
};

@Entity({ name: 'image_profiles' })
export class ImageProfile extends BaseAppEntity {
  @Index({ unique: true })
  @Column({ length: 120 })
  code!: string;

  @Column({ length: 180 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  diseaseCode?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cropCode?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  embeddingProvider?: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  embeddingModel?: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  qdrantCollection?: string | null;

  @Index()
  @Column({ length: 20, default: 'draft' })
  status!: ImageProfileStatus;

  @Column({ type: 'integer', default: 0 })
  version!: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  items!: ImageProfileItem[];

  @Column({ type: 'integer', default: 0 })
  readyCount!: number;

  @Column({ type: 'integer', default: 0 })
  duplicateCount!: number;

  @Column({ type: 'integer', default: 0 })
  failedCount!: number;

  @Column({ type: 'double precision', nullable: true })
  evaluationScore?: number | null;

  @Column({ type: 'text', nullable: true })
  lastError?: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastIndexedAt?: Date | null;
}
