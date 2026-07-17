import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'alerts' })
@Index(['userId', 'createdAt'])
export class Alert extends BaseAppEntity {
  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ length: 80 })
  type!: string;

  @Column({ length: 220 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  data!: Record<string, unknown>;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date | null;
}
