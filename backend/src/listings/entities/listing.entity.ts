import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export enum ListingStatus {
  DRAFT = 'draft',
  PENDING_OTP = 'pendingOtp',
  PUBLISHED = 'published',
  RESERVED = 'reserved',
  SOLD = 'sold',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

@Entity({ name: 'listings' })
@Index(['goodCode', 'status', 'createdAt'])
export class Listing extends BaseAppEntity {
  @Index()
  @Column({ type: 'uuid' })
  ownerId!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  assistingAgentId?: string | null;

  @Index()
  @Column({ length: 80 })
  goodCode!: string;

  @Index()
  @Column({ length: 160 })
  goodName!: string;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  imageUrls!: string[];

  @Column({ type: 'double precision' })
  quantity!: number;

  @Column({ type: 'double precision', default: 0 })
  reservedQuantity!: number;

  @Column({ default: 'kg' })
  unit!: string;

  @Column({ type: 'varchar', nullable: true })
  grade?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  harvestDate?: Date | null;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column({ type: 'double precision', nullable: true })
  latitude?: number | null;

  @Column({ type: 'double precision', nullable: true })
  longitude?: number | null;

  @Column({ type: 'double precision' })
  governmentPrice!: number;

  @Column({ type: 'double precision' })
  marketPrice!: number;

  @Column({ type: 'double precision' })
  minimumPrice!: number;

  @Index()
  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.PUBLISHED,
  })
  status!: ListingStatus;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;
}
