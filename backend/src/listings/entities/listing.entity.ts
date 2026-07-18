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

export enum MarketplaceCategory {
  AGRICULTURAL_OUTPUT = 'agriculturalOutput',
  LIVESTOCK = 'livestock',
  POULTRY = 'poultry',
  FISHERIES = 'fisheries',
  MACHINERY = 'machinery',
  MACHINERY_PART = 'machineryPart',
  SEED = 'seed',
  FERTILIZER = 'fertilizer',
  PESTICIDE = 'pesticide',
  FEED = 'feed',
  MEDICINE = 'medicine',
  EQUIPMENT_RENTAL = 'equipmentRental',
  SERVICE = 'service',
}

export enum ListingTransactionType {
  SALE = 'sale',
  RENTAL = 'rental',
  SERVICE = 'service',
}

@Entity({ name: 'listings' })
@Index(['category', 'status', 'createdAt'])
@Index(['goodCode', 'status', 'createdAt'])
export class Listing extends BaseAppEntity {
  @Index()
  @Column({ type: 'uuid' })
  ownerId!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  assistingAgentId?: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: MarketplaceCategory,
    default: MarketplaceCategory.AGRICULTURAL_OUTPUT,
  })
  category!: MarketplaceCategory;

  @Index()
  @Column({
    type: 'enum',
    enum: ListingTransactionType,
    default: ListingTransactionType.SALE,
  })
  transactionType!: ListingTransactionType;

  @Index()
  @Column({ length: 80 })
  goodCode!: string;

  @Index()
  @Column({ length: 160 })
  goodName!: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

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

  @Column({ default: true })
  negotiable!: boolean;

  @Column({ default: false })
  deliveryAvailable!: boolean;

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
