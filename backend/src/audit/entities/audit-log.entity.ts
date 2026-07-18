import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'audit_logs' })
export class AuditLog extends BaseAppEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  actorUserId?: string | null;

  @Index()
  @Column({ length: 120 })
  action!: string;

  @Index()
  @Column({ length: 80 })
  entityType!: string;

  @Index()
  @Column({ type: 'varchar', length: 120, nullable: true })
  entityId?: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  before!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  after!: Record<string, unknown>;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ipAddress?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string | null;
}
