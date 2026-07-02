import mongoose, { HydratedDocument } from 'mongoose';

export const GUIDANCE_MODEL = 'Guidance';

export interface Guidance {
  type: 'suggestion' | 'notice';
  title: string;
  message: string;
  targetRole: 'all' | 'farmer' | 'buyer' | 'agent' | 'medicineSeller';
  active: boolean;
  publishedAt: Date;
}

export type GuidanceDocument = HydratedDocument<Guidance>;

export const GuidanceSchema = new mongoose.Schema<Guidance>(
  {
    type: { type: String, enum: ['suggestion', 'notice'], required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    targetRole: {
      type: String,
      enum: ['all', 'farmer', 'buyer', 'agent', 'medicineSeller'],
      default: 'all',
      index: true,
    },
    active: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, autoIndex: true },
);
