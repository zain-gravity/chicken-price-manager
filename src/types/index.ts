// ============================================================
// Chicken Price Manager - Type Definitions
// ============================================================

/** A single chicken item in a price list */
export interface PriceItem {
  itemName: string;
  price: number;
  unit: string;
  note?: string;
  orderIndex: number;
}

/** User settings stored in the User document */
export interface UserSettings {
  currency: string;
  defaultUnit: string;
  showFooter: boolean;
  footerText: string;
  defaultExportFormat: 'pdf' | 'image' | 'both';
  imageTheme: 'light' | 'dark';
}

/** A complete daily price list */
export interface PriceListData {
  _id?: string;
  userId?: string;
  shopName: string;
  date: string; // ISO date string YYYY-MM-DD
  items: PriceItem[];
  createdAt?: string;
  updatedAt?: string;
}

/** User data (without password) */
export interface UserData {
  _id?: string;
  email: string;
  shopName: string;
  settings: UserSettings;
}

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Default chicken items for new users */
export const DEFAULT_ITEMS: PriceItem[] = [
  { itemName: 'Whole Chicken', price: 0, unit: 'per kg', orderIndex: 0 },
  { itemName: 'Curry Cut', price: 0, unit: 'per kg', orderIndex: 1 },
  { itemName: 'Boneless Breast', price: 0, unit: 'per kg', orderIndex: 2 },
  { itemName: 'Drumsticks', price: 0, unit: 'per kg', orderIndex: 3 },
  { itemName: 'Wings', price: 0, unit: 'per kg', orderIndex: 4 },
  { itemName: 'Keema (Mince)', price: 0, unit: 'per kg', orderIndex: 5 },
  { itemName: 'Liver', price: 0, unit: 'per kg', orderIndex: 6 },
  { itemName: 'Gizzard', price: 0, unit: 'per kg', orderIndex: 7 },
  { itemName: 'Country Chicken', price: 0, unit: 'per kg', orderIndex: 8 },
];

/** Default user settings */
export const DEFAULT_SETTINGS: UserSettings = {
  currency: '₹',
  defaultUnit: 'per kg',
  showFooter: true,
  footerText: 'Prices may change without notice. Call for bulk orders.',
  defaultExportFormat: 'both',
  imageTheme: 'light',
};
