import mongoose, { HydratedDocument } from 'mongoose';

export const ALERT_MODEL = 'Alert';

export interface Alert {
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  readAt?: Date;
}

export type AlertDocument = HydratedDocument<Alert>;

export const AlertSchema = new mongoose.Schema<Alert>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    readAt: Date,
  },
  { timestamps: true, autoIndex: true },
);

AlertSchema.index({ userId: 1, createdAt: -1 });
