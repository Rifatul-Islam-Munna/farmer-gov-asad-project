import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'market_prices' })
@Index(['goodCode', 'region', 'priceDate'], { unique: true })
export class MarketPrice extends BaseAppEntity {
  @Index()
  @Column({ length: 80 })
  goodCode!: string;

  @Column({ length: 160 })
  goodName!: string;

  @Column({ default: 'kg' })
  unit!: string;

  @Column({ type: 'double precision' })
  governmentPrice!: number;

  @Column({ type: 'double precision' })
  marketPrice!: number;

  @Column({ type: 'double precision' })
  previousMarketPrice!: number;

  @Column({ default: 'National' })
  region!: string;

  @Column({ default: 'Government Market' })
  marketName!: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string | null;

  @Index()
  @Column({ type: 'date' })
  priceDate!: string;
}
