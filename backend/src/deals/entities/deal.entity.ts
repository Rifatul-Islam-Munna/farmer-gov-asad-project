import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export enum OfferStatus {
  PENDING = 'pending',
  COUNTERED = 'countered',
  ACCEPTED_BY_BUYER = 'acceptedByBuyer',
  ACCEPTED_BY_FARMER = 'acceptedByFarmer',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export type OfferHistoryEntry = {
  byUserId: string;
  quantity: number;
  unitPrice: number;
  createdAt: string | Date;
};

@Entity({ name: 'offers' })
export class Offer extends BaseAppEntity {
  @Index()
  @Column({ type: 'uuid' })
  listingId!: string;

  @Index()
  @Column({ type: 'uuid' })
  buyerId!: string;

  @Index()
  @Column({ type: 'uuid' })
  farmerId!: string;

  @Column({ type: 'double precision' })
  quantity!: number;

  @Column({ type: 'double precision' })
  unitPrice!: number;

  @Index()
  @Column({ type: 'enum', enum: OfferStatus, default: OfferStatus.PENDING })
  status!: OfferStatus;

  @Column({ default: true })
  buyerAccepted!: boolean;

  @Column({ default: false })
  farmerAccepted!: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  history!: OfferHistoryEntry[];

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt?: Date | null;
}

export type DealStatus = 'confirmed' | 'completed' | 'cancelled' | 'disputed';

@Entity({ name: 'deals' })
export class Deal extends BaseAppEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  offerId!: string;

  @Index()
  @Column({ type: 'uuid' })
  listingId!: string;

  @Index()
  @Column({ type: 'uuid' })
  buyerId!: string;

  @Index()
  @Column({ type: 'uuid' })
  farmerId!: string;

  @Column({ type: 'double precision' })
  quantity!: number;

  @Column({ type: 'double precision' })
  unitPrice!: number;

  @Column({ type: 'double precision' })
  totalPrice!: number;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'confirmed' })
  status!: DealStatus;

  @Index()
  @Column({ type: 'timestamptz' })
  confirmedAt!: Date;
}
