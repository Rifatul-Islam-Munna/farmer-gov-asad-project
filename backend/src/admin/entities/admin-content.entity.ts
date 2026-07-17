import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export type GuidanceType = 'suggestion' | 'notice';
export type GuidanceTargetRole =
  'all' | 'farmer' | 'buyer' | 'agent' | 'medicineSeller';

@Entity({ name: 'guidance' })
export class Guidance extends BaseAppEntity {
  @Column({ type: 'varchar', length: 20 })
  type!: GuidanceType;

  @Column({ length: 220 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Index()
  @Column({ type: 'varchar', length: 40, default: 'all' })
  targetRole!: GuidanceTargetRole;

  @Index()
  @Column({ default: true })
  active!: boolean;

  @Index()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  publishedAt!: Date;
}
