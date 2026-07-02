import mongoose, { HydratedDocument } from 'mongoose';

export const OFFER_MODEL = 'Offer';
export const DEAL_MODEL = 'Deal';

export enum OfferStatus {
  PENDING = 'pending',
  COUNTERED = 'countered',
  ACCEPTED_BY_BUYER = 'acceptedByBuyer',
  ACCEPTED_BY_FARMER = 'acceptedByFarmer',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface Offer {
  listingId: string;
  buyerId: string;
  farmerId: string;
  quantity: number;
  unitPrice: number;
  status: OfferStatus;
  buyerAccepted: boolean;
  farmerAccepted: boolean;
  history: Array<{
    byUserId: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
  }>;
  expiresAt?: Date;
  confirmedAt?: Date;
}

export interface Deal {
  offerId: string;
  listingId: string;
  buyerId: string;
  farmerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'disputed';
  confirmedAt: Date;
}

export type OfferDocument = HydratedDocument<Offer>;
export type DealDocument = HydratedDocument<Deal>;

export const OfferSchema = new mongoose.Schema<Offer>(
  {
    listingId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unitPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: OfferStatus,
      default: OfferStatus.PENDING,
      index: true,
    },
    buyerAccepted: { type: Boolean, default: true },
    farmerAccepted: { type: Boolean, default: false },
    history: { type: [mongoose.Schema.Types.Mixed], default: [] },
    expiresAt: Date,
    confirmedAt: Date,
  },
  { timestamps: true, autoIndex: true },
);

export const DealSchema = new mongoose.Schema<Deal>(
  {
    offerId: { type: String, required: true, unique: true, index: true },
    listingId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    farmerId: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled', 'disputed'],
      default: 'confirmed',
      index: true,
    },
    confirmedAt: { type: Date, required: true },
  },
  { timestamps: true, autoIndex: true },
);
