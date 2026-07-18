import { BaseAppEntity } from '../../database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'worker_job_records' })
@Index(['queueName', 'jobId'], { unique: true })
@Index(['status', 'createdAt'])
export class WorkerJobRecord extends BaseAppEntity {
  @Column({ length: 40 })
  queueName!: string;

  @Column({ length: 120 })
  jobName!: string;

  @Column({ length: 180 })
  jobId!: string;

  @Column({ length: 20, default: 'processing' })
  status!: 'processing' | 'completed' | 'failed';

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  payload!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  result!: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @Column({ type: 'integer', default: 0 })
  attemptsMade!: number;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date | null;
}
