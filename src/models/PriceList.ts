// ============================================================
// PriceList Model
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { PriceItem } from '@/types';

export interface IPriceList extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  date: string; // YYYY-MM-DD format
  items: PriceItem[];
  createdAt: Date;
  updatedAt: Date;
}

const priceItemSchema = new Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    unit: {
      type: String,
      default: 'per kg',
      trim: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const priceListSchema = new Schema<IPriceList>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [priceItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries: find by user + date
priceListSchema.index({ userId: 1, date: -1 });

// Prevent model recompilation in development (hot reload)
const PriceList: Model<IPriceList> =
  mongoose.models.PriceList ||
  mongoose.model<IPriceList>('PriceList', priceListSchema);

export default PriceList;
