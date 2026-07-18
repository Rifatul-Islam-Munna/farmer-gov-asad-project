import { Column, Entity, Index } from 'typeorm';
import { BaseAppEntity } from '../../lib/database/base.entity';

@Entity('marketplace_ai_tasks')
@Index(['productId', 'type', 'createdAt'])
@Index(['status', 'createdAt'])
export class MarketplaceAiTask extends BaseAppEntity {
  @Column('uuid') productId!: string;
  @Column('uuid') requestedBy!: string;
  @Column({ length: 40 }) type!:
    'image-background-removal' | 'description-generation';
  @Column({ length: 20, default: 'queued' }) status!:
    'queued' | 'processing' | 'completed' | 'failed' | 'applied' | 'rejected';
  @Column('jsonb', { default: () => "'{}'::jsonb" }) input!: Record<
    string,
    unknown
  >;
  @Column('jsonb', { default: () => "'{}'::jsonb" }) output!: Record<
    string,
    unknown
  >;
  @Column('text', { nullable: true }) error?: string | null;
  @Column({ type: 'varchar', length: 120, nullable: true }) provider?:
    string | null;
  @Column({ type: 'varchar', length: 120, nullable: true }) model?:
    string | null;
  @Column('timestamptz', { nullable: true }) completedAt?: Date | null;
  @Column('timestamptz', { nullable: true }) reviewedAt?: Date | null;
}
