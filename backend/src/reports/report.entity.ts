import mongoose, { HydratedDocument } from 'mongoose';

export const REPORT_MODEL = 'Report';

export enum ReportTargetType {
  USER = 'user',
  LISTING = 'listing',
  DEAL = 'deal',
  GUIDANCE = 'guidance',
  SYSTEM = 'system',
  OTHER = 'other',
}

export enum ReportStatus {
  OPEN = 'open',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface Report {
  reporterId: string;
  targetType: ReportTargetType;
  targetId?: string;
  subject: string;
  description: string;
  status: ReportStatus;
  adminNote?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export type ReportDocument = HydratedDocument<Report>;

export const ReportSchema = new mongoose.Schema<Report>(
  {
    reporterId: { type: String, required: true, index: true },
    targetType: {
      type: String,
      enum: ReportTargetType,
      required: true,
      index: true,
    },
    targetId: { type: String, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ReportStatus,
      default: ReportStatus.OPEN,
      index: true,
    },
    adminNote: { type: String, trim: true, maxlength: 3000 },
    resolvedBy: String,
    resolvedAt: Date,
  },
  { timestamps: true, autoIndex: true },
);

ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });