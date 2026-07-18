import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'advertisements' })
export class Advertisement extends BaseAppEntity {
  @Column({ length: 180 }) title!: string;
  @Column({ type: 'text', default: '' }) description!: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) imageUrl?: string | null;
  @Column({ type: 'varchar', length: 500, nullable: true }) destinationUrl?: string | null;
  @Index() @Column({ type: 'varchar', length: 40, default: 'all' }) targetRole!: string;
  @Index() @Column({ default: true }) active!: boolean;
  @Index() @Column({ type: 'timestamptz', nullable: true }) startsAt?: Date | null;
  @Index() @Column({ type: 'timestamptz', nullable: true }) endsAt?: Date | null;
}

@Entity({ name: 'support_tickets' })
export class SupportTicket extends BaseAppEntity {
  @Index() @Column({ type: 'uuid', nullable: true }) requesterId?: string | null;
  @Column({ length: 180 }) subject!: string;
  @Column({ type: 'text' }) message!: string;
  @Index() @Column({ type: 'varchar', length: 30, default: 'open' }) status!: string;
  @Index() @Column({ type: 'varchar', length: 20, default: 'normal' }) priority!: string;
  @Column({ type: 'uuid', nullable: true }) assignedTo?: string | null;
  @Column({ type: 'text', nullable: true }) adminNote?: string | null;
}
