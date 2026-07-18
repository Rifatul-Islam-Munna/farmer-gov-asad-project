import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export type AuthChallengePurpose = 'phoneVerification' | 'passwordReset';

@Entity({ name: 'auth_challenges' })
@Index(['destination', 'purpose', 'createdAt'])
export class AuthChallenge extends BaseAppEntity {
  @Column({ type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({ length: 120 })
  destination!: string;

  @Column({ length: 30 })
  purpose!: AuthChallengePurpose;

  @Column({ length: 64, select: false })
  codeHash!: string;

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'integer', default: 0 })
  attempts!: number;

  @Column({ type: 'integer', default: 5 })
  maxAttempts!: number;

  @Column({ type: 'timestamptz' })
  resendAvailableAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  consumedAt?: Date | null;
}
