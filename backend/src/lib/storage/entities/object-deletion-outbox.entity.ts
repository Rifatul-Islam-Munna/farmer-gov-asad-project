import { Column, Entity, Index } from 'typeorm';
import { BaseAppEntity } from '../../database/base.entity';

@Entity({ name: 'object_deletion_outbox' })
@Index(['status', 'nextAttemptAt'])
export class ObjectDeletionOutbox extends BaseAppEntity {
  @Column({ length: 500 })
  objectKey!: string;

  @Column({ length: 80 })
  entityType!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityId?: string | null;

  @Column({ length: 200 })
  reason!: string;

  @Column({ length: 20, default: 'pending' })
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ type: 'integer', default: 0 })
  attempts!: number;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  nextAttemptAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  lastError?: string | null;
}
