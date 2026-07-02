import mongoose, { HydratedDocument } from 'mongoose';

export const MEDICINE_MODEL = 'Medicine';
export const SELLER_INVENTORY_MODEL = 'SellerInventory';

export interface Medicine {
  code: string;
  name: string;
  type: 'medicine' | 'pesticide' | 'fertilizer';
  description?: string;
  active: boolean;
}

export interface SellerInventory {
  sellerId: string;
  medicineCode: string;
  medicineName: string;
  type: string;
  stockQuantity: number;
  unit: string;
  price: number;
  shopName: string;
  address: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

export type MedicineDocument = HydratedDocument<Medicine>;
export type SellerInventoryDocument = HydratedDocument<SellerInventory>;

export const MedicineSchema = new mongoose.Schema<Medicine>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, index: true },
    type: {
      type: String,
      enum: ['medicine', 'pesticide', 'fertilizer'],
      required: true,
      index: true,
    },
    description: String,
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, autoIndex: true },
);

export const SellerInventorySchema = new mongoose.Schema<SellerInventory>(
  {
    sellerId: { type: String, required: true, index: true },
    medicineCode: { type: String, required: true, index: true },
    medicineName: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    stockQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    shopName: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, autoIndex: true },
);

SellerInventorySchema.index(
  { sellerId: 1, medicineCode: 1 },
  { unique: true },
);
