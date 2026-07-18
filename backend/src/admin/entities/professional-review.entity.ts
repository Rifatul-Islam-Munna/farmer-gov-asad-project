import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export type ProfessionalReviewStatus =
  'pending' | 'inReview' | 'approved' | 'rejected';

export type ReviewDocument = {
  key: string;
  label: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
};

@Entity({ name: 'professional_reviews' })
export class ProfessionalReview extends BaseAppEntity {
  @Index({ unique: true })
  @Column({ type: 'uuid' })
  userId!: string;

  @Index()
  @Column({ length: 40 })
  role!: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  documents!: ReviewDocument[];

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  checklist!: Record<string, boolean>;

  @Index()
  @Column({ length: 20, default: 'pending' })
  status!: ProfessionalReviewStatus;

  @Column({ type: 'text', nullable: true })
  reviewerNote?: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewerId?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt?: Date | null;
}
