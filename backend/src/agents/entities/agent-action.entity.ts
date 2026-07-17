import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export enum AgentActionType {
  CREATE_FARMER = 'createFarmer',
  CREATE_LISTING = 'createListing',
}

export enum AgentActionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity({ name: 'agent_actions' })
export class AgentAction extends BaseAppEntity {
  @Index()
  @Column({ type: 'enum', enum: AgentActionType })
  type!: AgentActionType;

  @Index()
  @Column({
    type: 'enum',
    enum: AgentActionStatus,
    default: AgentActionStatus.PENDING,
  })
  status!: AgentActionStatus;

  @Index()
  @Column({ type: 'uuid' })
  agentId!: string;

  @Index()
  @Column({ length: 40 })
  farmerPhone!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  farmerId?: string | null;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ select: false })
  otpHash!: string;

  @Column({ type: 'integer', default: 0 })
  attempts!: number;

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date | null;
}
