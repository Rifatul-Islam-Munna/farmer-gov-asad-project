import mongoose, { HydratedDocument } from 'mongoose';

export const MARKET_PRICE_MODEL = 'MarketPrice';

export interface MarketPrice {
  goodCode: string;
  goodName: string;
  unit: string;
  governmentPrice: number;
  marketPrice: number;
  previousMarketPrice: number;
  region: string;
  marketName: string;
  imageUrl?: string;
  priceDate: Date;
}

export type MarketPriceDocument = HydratedDocument<MarketPrice>;

export const MarketPriceSchema = new mongoose.Schema<MarketPrice>(
  {
    goodCode: { type: String, required: true, index: true, trim: true },
    goodName: { type: String, required: true, trim: true },
    unit: { type: String, required: true, default: 'kg' },
    governmentPrice: { type: Number, required: true, min: 0 },
    marketPrice: { type: Number, required: true, min: 0 },
    previousMarketPrice: { type: Number, required: true, min: 0 },
    region: { type: String, required: true, default: 'National' },
    marketName: {
      type: String,
      required: true,
      default: 'Government Market',
    },
    imageUrl: String,
    priceDate: { type: Date, required: true, index: true },
  },
  { timestamps: true, autoIndex: true },
);

MarketPriceSchema.index(
  { goodCode: 1, region: 1, priceDate: -1 },
  { unique: true },
);
