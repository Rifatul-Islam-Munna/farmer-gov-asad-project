import mongoose, { HydratedDocument } from 'mongoose';

export enum UserType {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

export const USER_MODEL = 'User';

export interface User {
  name: string;
  email?: string;
  phoneNumber: string;
  credentialHash: string;
  role: UserType;
  gender?: string;
  isOtpVerified: boolean;
  otpNumber?: string;
  otpValidatedAt?: Date;
  numberOfConnections: number;
  planId?: string;
  planName: string;
  storageLimitGb: number;
  monthlyEmailLimit: number;
  storageUsedBytes: number;
  monthlyEmailsUsed: number;
  planFeatures: Record<string, boolean>;
  monthlyUsageKey?: string;
  planActivatedAt?: Date;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    credentialHash: { type: String, required: true },
    role: { type: String, enum: UserType, default: UserType.USER },
    gender: String,
    isOtpVerified: { type: Boolean, default: true },
    otpNumber: String,
    otpValidatedAt: Date,
    numberOfConnections: { type: Number, default: 0 },
    planId: String,
    planName: { type: String, default: 'Free' },
    storageLimitGb: { type: Number, default: 0 },
    monthlyEmailLimit: { type: Number, default: 0 },
    storageUsedBytes: { type: Number, default: 0 },
    monthlyEmailsUsed: { type: Number, default: 0 },
    planFeatures: { type: Object, default: {} },
    monthlyUsageKey: String,
    planActivatedAt: Date,
  },
  { timestamps: true, autoIndex: true },
);
