import mongoose, { HydratedDocument } from 'mongoose';

export const GOODS_CATEGORY_MODEL = 'GoodsCategory';
export const GOOD_MODEL = 'Good';

export interface GoodsCategory {
  code: string;
  name: string;
  localName?: string;
  icon?: string;
  active: boolean;
}

export interface Good {
  code: string;
  name: string;
  localName?: string;
  categoryCode: string;
  defaultUnit: string;
  imageUrl?: string;
  active: boolean;
}

export type GoodsCategoryDocument = HydratedDocument<GoodsCategory>;
export type GoodDocument = HydratedDocument<Good>;

export const GoodsCategorySchema = new mongoose.Schema<GoodsCategory>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    localName: { type: String, trim: true },
    icon: { type: String, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, autoIndex: true },
);

export const GoodSchema = new mongoose.Schema<Good>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, index: true },
    localName: { type: String, trim: true, index: true },
    categoryCode: { type: String, required: true, index: true },
    defaultUnit: { type: String, required: true, default: 'kg' },
    imageUrl: { type: String, trim: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, autoIndex: true },
);

GoodSchema.index({ name: 'text', localName: 'text', code: 'text' });
