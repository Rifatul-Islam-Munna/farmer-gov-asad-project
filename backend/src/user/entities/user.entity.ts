import { BaseAppEntity } from '../../lib/database/base.entity';
import { Column, Entity, Index } from 'typeorm';

export enum UserType {
  ADMIN = 'admin',
  AGENT = 'agent',
  FARMER = 'farmer',
  BUYER = 'buyer',
  MEDICINE_SELLER = 'medicineSeller',
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type UserLocation = {
  latitude?: number;
  longitude?: number;
  updatedAt?: string | Date;
};

@Entity({ name: 'users' })
export class User extends BaseAppEntity {
  @Column({ length: 160 })
  name!: string;

  @Index({ unique: true, where: '"email" IS NOT NULL' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Index({ unique: true })
  @Column({ length: 40 })
  phoneNumber!: string;

  @Column({ select: false })
  credentialHash!: string;

  @Index()
  @Column({ type: 'enum', enum: UserType, default: UserType.FARMER })
  role!: UserType;

  @Column({ type: 'varchar', nullable: true, length: 40 })
  gender?: string | null;

  @Column({ type: 'double precision', nullable: true })
  landAmount?: number | null;

  @Column({ type: 'text', array: true, default: () => 'ARRAY[]::text[]' })
  documents!: string[];

  @Column({ type: 'varchar', nullable: true })
  businessName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  shopName?: string | null;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  location?: UserLocation | null;

  @Index()
  @Column({ type: 'varchar', length: 20, default: 'approved' })
  verificationStatus!: VerificationStatus;

  @Column({ default: true })
  isOtpVerified!: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  otpNumber?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  otpValidatedAt?: Date | null;

  @Column({ type: 'integer', default: 0 })
  numberOfConnections!: number;

  @Column({ type: 'varchar', nullable: true })
  planId?: string | null;

  @Column({ default: 'Free' })
  planName!: string;

  @Column({ type: 'double precision', default: 0 })
  storageLimitGb!: number;

  @Column({ type: 'integer', default: 0 })
  monthlyEmailLimit!: number;

  @Column({ type: 'bigint', default: 0 })
  storageUsedBytes!: string;

  @Column({ type: 'integer', default: 0 })
  monthlyEmailsUsed!: number;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  planFeatures!: Record<string, boolean>;

  @Column({ type: 'varchar', nullable: true })
  monthlyUsageKey?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  planActivatedAt?: Date | null;
}
