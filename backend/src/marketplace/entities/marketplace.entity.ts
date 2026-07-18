import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

export type Money = number;

@Entity('marketplace_products')
@Index(['status', 'categoryCode', 'createdAt'])
@Index(['sellerId', 'status'])
@Index(['sellerId', 'catalogCode'], { unique: true })
export class MarketplaceProduct extends BaseAppEntity {
  @Column('uuid') sellerId!: string;
  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true }) catalogCode?: string | null;
  @Index()
  @Column({ type: 'varchar', length: 30, default: 'general' }) productKind!: 'general' | 'medicine' | 'pesticide' | 'fertilizer';
  @Column({ type: 'varchar', length: 30, nullable: true }) unit?: string | null;
  @Column({ length: 80 }) categoryCode!: string;
  @Column({ type: 'varchar', length: 80, nullable: true }) subcategoryCode?:
    string | null;
  @Column({ length: 180 }) title!: string;
  @Column('text') description!: string;
  @Column('text', { nullable: true }) useCases?: string | null;
  @Column('text', { nullable: true }) symptoms?: string | null;
  @Column('text', { nullable: true }) safetyNotes?: string | null;
  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  imageUrls!: string[];
  @Column('jsonb', { default: () => "'{}'::jsonb" }) specifications!: Record<
    string,
    unknown
  >;
  @Index()
  @Column({ type: 'varchar', length: 120, nullable: true })
  machineryBrand?: string | null;
  @Index()
  @Column({ type: 'varchar', length: 120, nullable: true })
  machineryModel?: string | null;
  @Index() @Column('integer', { nullable: true }) machineryYear?: number | null;
  @Index() @Column('double precision', { nullable: true }) machineryPowerHp?:
    number | null;
  @Column('double precision') price!: Money;
  @Column({ length: 8, default: 'BDT' }) currency!: string;
  @Column('integer', { default: 0 }) stock!: number;
  @Column({ length: 30, default: 'sale' }) transactionType!:
    'sale' | 'rental' | 'auction';
  @Column('double precision', { nullable: true }) rentalDailyRate?:
    number | null;
  @Column('double precision', { nullable: true }) latitude?: number | null;
  @Column('double precision', { nullable: true }) longitude?: number | null;
  @Column({ length: 30, default: 'draft' }) status!:
    'draft' | 'pending' | 'published' | 'rejected' | 'suspended' | 'archived';
  @Column('text', { nullable: true }) moderationReason?: string | null;
  @Column('uuid', { nullable: true }) moderatedBy?: string | null;
  @Column('timestamptz', { nullable: true }) moderatedAt?: Date | null;
  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' }) moderationEvidenceUrls!: string[];
  @Column('text', { nullable: true }) moderationAuditNotes?: string | null;
  @Column('jsonb', { default: () => "'[]'::jsonb" }) moderationHistory!: Array<{ actorId: string; status: string; reason: string; auditNotes?: string; evidenceUrls: string[]; createdAt: string }>;
  @Column({ length: 30, default: 'none' }) appealStatus!:
    'none' | 'submitted' | 'approved' | 'rejected';
  @Column('text', { nullable: true }) appealMessage?: string | null;
  @Column({ default: false }) restrictedProduct!: boolean;
  @Column({ default: false }) requiresLicense!: boolean;
  @Column({ default: false }) licenseVerified!: boolean;
  @Column('integer', { default: 0 }) soldCount!: number;
  @Column('tsvector', { nullable: true, select: false }) searchVector?: string;
}

@Entity('marketplace_favorites')
@Unique(['userId', 'productId'])
export class MarketplaceFavorite extends BaseAppEntity {
  @Column('uuid') userId!: string;
  @Column('uuid') productId!: string;
}

@Entity('marketplace_saved_searches')
export class MarketplaceSavedSearch extends BaseAppEntity {
  @Column('uuid') userId!: string;
  @Column({ length: 120 }) name!: string;
  @Column('jsonb') filters!: Record<string, unknown>;
}

@Entity('marketplace_cart_items')
@Unique(['userId', 'productId'])
export class MarketplaceCartItem extends BaseAppEntity {
  @Column('uuid') userId!: string;
  @Column('uuid') productId!: string;
  @Column('integer') quantity!: number;
}

@Entity('marketplace_orders')
@Index(['buyerId', 'createdAt'])
export class MarketplaceOrder extends BaseAppEntity {
  @Column({ length: 30, unique: true }) orderNumber!: string;
  @Column('uuid') buyerId!: string;
  @Column('jsonb') items!: Array<{
    productId: string;
    sellerId: string;
    title: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  @Column('double precision') subtotal!: number;
  @Column('double precision', { default: 0 }) deliveryFee!: number;
  @Column('double precision') total!: number;
  @Column({ length: 8, default: 'BDT' }) currency!: string;
  @Column({ length: 30, default: 'pending' }) status!:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  @Column({ length: 30, default: 'unpaid' }) paymentStatus!:
    'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
  @Column({ type: 'varchar', length: 80, nullable: true }) paymentProvider?:
    string | null;
  @Column({ type: 'varchar', length: 160, nullable: true }) paymentReference?:
    string | null;
  @Column('jsonb') deliveryAddress!: Record<string, unknown>;
  @Column({ type: 'varchar', length: 160, nullable: true }) trackingNumber?:
    string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) invoiceUrl?:
    string | null;
}

@Entity('marketplace_rental_bookings')
@Index(['productId', 'startsAt', 'endsAt'])
export class MarketplaceRentalBooking extends BaseAppEntity {
  @Column('uuid') productId!: string;
  @Column('uuid') renterId!: string;
  @Column('timestamptz') startsAt!: Date;
  @Column('timestamptz') endsAt!: Date;
  @Column({ length: 30, default: 'pending' }) status!:
    'pending' | 'confirmed' | 'cancelled' | 'completed';
  @Column('double precision') total!: number;
}

@Entity('marketplace_bulk_requests')
export class MarketplaceBulkRequest extends BaseAppEntity {
  @Column('uuid') buyerId!: string;
  @Column({ length: 180 }) title!: string;
  @Column('text') description!: string;
  @Column({ length: 80 }) categoryCode!: string;
  @Column('double precision') quantity!: number;
  @Column({ length: 30 }) unit!: string;
  @Column('timestamptz', { nullable: true }) neededBy?: Date | null;
  @Column({ length: 30, default: 'open' }) status!:
    'open' | 'matched' | 'closed' | 'cancelled';
  @Column('uuid', { nullable: true }) selectedOfferId?: string | null;
}

@Entity('marketplace_bulk_offers')
@Index(['requestId', 'status'])
export class MarketplaceBulkOffer extends BaseAppEntity {
  @Column('uuid') requestId!: string;
  @Column('uuid') sellerId!: string;
  @Column('double precision') unitPrice!: number;
  @Column('double precision') availableQuantity!: number;
  @Column({ length: 30 }) unit!: string;
  @Column('integer', { default: 0 }) deliveryDays!: number;
  @Column('text', { nullable: true }) note?: string | null;
  @Column({ length: 20, default: 'submitted' }) status!:
    'submitted' | 'selected' | 'rejected' | 'withdrawn';
}

@Entity('marketplace_auctions')
export class MarketplaceAuction extends BaseAppEntity {
  @Column('uuid') productId!: string;
  @Column('double precision') startingPrice!: number;
  @Column('double precision', { nullable: true }) reservePrice?: number | null;
  @Column('double precision', { default: 0 }) highestBid!: number;
  @Column('uuid', { nullable: true }) highestBidderId?: string | null;
  @Column('timestamptz') startsAt!: Date;
  @Column('timestamptz') endsAt!: Date;
  @Column({ length: 20, default: 'scheduled' }) status!:
    'scheduled' | 'live' | 'ended' | 'cancelled';
}

@Entity('marketplace_bids')
@Index(['auctionId', 'amount'])
export class MarketplaceBid extends BaseAppEntity {
  @Column('uuid') auctionId!: string;
  @Column('uuid') bidderId!: string;
  @Column('double precision') amount!: number;
}

@Entity('marketplace_messages')
@Index(['conversationId', 'createdAt'])
export class MarketplaceMessage extends BaseAppEntity {
  @Column({ length: 100 }) conversationId!: string;
  @Column('uuid') senderId!: string;
  @Column('uuid') receiverId!: string;
  @Column('uuid', { nullable: true }) productId?: string | null;
  @Column('text') message!: string;
  @Column('timestamptz', { nullable: true }) readAt?: Date | null;
}

@Entity('marketplace_reviews')
@Unique(['orderId', 'reviewerId', 'productId'])
export class MarketplaceReview extends BaseAppEntity {
  @Column('uuid') orderId!: string;
  @Column('uuid') reviewerId!: string;
  @Column('uuid') productId!: string;
  @Column('integer') rating!: number;
  @Column('text', { nullable: true }) comment?: string | null;
  @Column({ length: 20, default: 'published' }) status!: 'published' | 'hidden';
}

@Entity('marketplace_payments')
@Index(['orderId', 'status'])
export class MarketplacePayment extends BaseAppEntity {
  @Column('uuid') orderId!: string;
  @Column({ length: 40 }) provider!: string;
  @Column({ length: 160, unique: true }) providerReference!: string;
  @Column('double precision') amount!: number;
  @Column({ length: 8, default: 'BDT' }) currency!: string;
  @Column({ length: 30, default: 'pending' }) status!:
    'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  @Column('jsonb', { default: () => "'{}'::jsonb" }) providerPayload!: Record<
    string,
    unknown
  >;
  @Column('timestamptz', { nullable: true }) paidAt?: Date | null;
}

@Entity('marketplace_refunds')
@Index(['paymentId', 'status'])
export class MarketplaceRefund extends BaseAppEntity {
  @Column('uuid') paymentId!: string;
  @Column('uuid') orderId!: string;
  @Column('double precision') amount!: number;
  @Column({ length: 30, default: 'pending' }) status!:
    'pending' | 'succeeded' | 'failed';
  @Column({ type: 'varchar', length: 160, nullable: true }) providerReference?:
    string | null;
  @Column('text') reason!: string;
  @Column('jsonb', { default: () => "'{}'::jsonb" }) providerPayload!: Record<
    string,
    unknown
  >;
}


