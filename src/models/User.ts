// ============================================================
// User Model
// ============================================================

import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserSettings } from '@/types';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  shopName: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema(
  {
    currency: { type: String, default: '₹' },
    defaultUnit: { type: String, default: 'per kg' },
    showFooter: { type: Boolean, default: true },
    footerText: {
      type: String,
      default: 'Prices may change without notice. Call for bulk orders.',
    },
    defaultExportFormat: {
      type: String,
      enum: ['pdf', 'image', 'both'],
      default: 'both',
    },
    imageTheme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    shopName: {
      type: String,
      default: 'My Chicken Shop',
      trim: true,
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development (hot reload)
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
