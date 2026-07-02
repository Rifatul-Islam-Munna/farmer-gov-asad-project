import mongoose, { HydratedDocument } from 'mongoose';

export const LISTING_MODEL = 'Listing';

export enum ListingStatus {
  DRAFT = 'draft',
  PENDING_OTP = 'pendingOtp',
  PUBLISHED = 'published',
  RESERVED = 'reserved',
  SOLD = 'sold',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export interface Listing {
  ownerId: string;
  assistingAgentId?: string;
  goodCode: string;
  goodName: string;
  imageUrls: string[];
  quantity: number;
  reservedQuantity: number;
  unit: string;
  grade?: string;
  harvestDate?: Date;
  address?: string;
  latitude?: number;
  longitude?: number;
  governmentPrice: number;
  marketPrice: number;
  minimumPrice: number;
  status: ListingStatus;
  publishedAt?: Date;
  expiresAt?: Date;
}

export type ListingDocument = HydratedDocument<Listing>;

export const ListingSchema = new mongoose.Schema<Listing>(
  {
    ownerId: { type: String, required: true, index: true },
    assistingAgentId: { type: String, index: true },
    goodCode: { type: String, required: true, index: true, trim: true },
    goodName: { type: String, required: true, index: true, trim: true },
    imageUrls: { type: [String], default: [] },
    quantity: { type: Number, required: true, min: 0.01 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, required: true, default: 'kg' },
    grade: String,
    harvestDate: Date,
    address: String,
    latitude: Number,
    longitude: Number,
    governmentPrice: { type: Number, required: true, min: 0 },
    marketPrice: { type: Number, required: true, min: 0 },
    minimumPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ListingStatus,
      default: ListingStatus.PUBLISHED,
      index: true,
    },
    publishedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true, autoIndex: true },
);

ListingSchema.index({ goodCode: 1, status: 1, createdAt: -1 });
ListingSchema.index({ goodName: 'text', goodCode: 'text', address: 'text' });
