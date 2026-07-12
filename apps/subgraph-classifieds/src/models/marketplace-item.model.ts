import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const MARKETPLACE_CATEGORIES = [
  'ELECTRONICS',
  'CLOTHING',
  'BOOKS',
  'FURNITURE',
  'FOOD',
  'BABY_AND_KIDS',
  'CHARITY_ITEMS',
  'OTHER',
] as const;

export type MarketplaceCategory = (typeof MARKETPLACE_CATEGORIES)[number];

export const ITEM_CONDITIONS = [
  'NEW',
  'LIKE_NEW',
  'GOOD',
  'FAIR',
] as const;

export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const LISTING_STATUSES = [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'PENDING_REVIEW',
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

export interface IMarketplaceItem {
  _id: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId | null;
  createdBy: string;   // firebaseUid of the user who created this listing

  title:       string;
  category:    MarketplaceCategory;
  subCategory: string | null;   // free text — "Bibles", "Textbooks", etc.
  description: string;

  condition:       ItemCondition;
  dimensions:      string | null;   // free text — "60cm x 40cm x 4.5cm"
  otherAttributes: string | null;   // free text — language, usage, warnings

  region:     string | null;   // display — "Lagos, Nigeria"
  regionCode: string | null;   // filter  — "NG-LA"

  sellingPrice:    number;
  maxRetailPrice:  number | null;   // null = no MRP; shown > sellingPrice = discount badge
  currency:        string;          // ISO code — "NGN", "GBP", "USD"

  isDonation: boolean;   // true = free charity listing; shown in "Community Gives" section

  imageUrls: string[];   // up to 10 Cloudinary URLs

  // Seller contact — Phase 1: shown directly; Phase 2: gated behind offer flow
  contactInfo:        string | null;   // phone / email stored at creation time
  showContactOnOffer: boolean;         // if true, hide contactInfo until buyer makes an offer (Phase 2 logic)

  // Platform state
  status:        ListingStatus;
  isPromoted:    boolean;
  promotedUntil: Date | null;
  flagCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export type MarketplaceItemDocument = HydratedDocument<IMarketplaceItem>;

export const MarketplaceItemSchema = new Schema<IMarketplaceItem>(
  {
    organisationId: { type: Schema.Types.ObjectId, default: null },
    createdBy:      { type: String,                required: true },

    title:       { type: String, required: true },
    category:    { type: String, enum: MARKETPLACE_CATEGORIES, required: true },
    subCategory: { type: String, default: null },
    description: { type: String, required: true },

    condition:       { type: String, enum: ITEM_CONDITIONS, required: true },
    dimensions:      { type: String, default: null },
    otherAttributes: { type: String, default: null },

    region:     { type: String, default: null },
    regionCode: { type: String, default: null },

    sellingPrice:   { type: Number, required: true },
    maxRetailPrice: { type: Number, default: null },
    currency:       { type: String, required: true },

    isDonation: { type: Boolean, default: false },

    imageUrls: [{ type: String }],

    contactInfo:        { type: String,  default: null },
    showContactOnOffer: { type: Boolean, default: false },

    status:        { type: String, enum: LISTING_STATUSES, default: 'AVAILABLE' },
    isPromoted:    { type: Boolean, default: false },
    promotedUntil: { type: Date,    default: null },
    flagCount:     { type: Number,  default: 0 },
  },
  { timestamps: true },
);

// Main discovery — region + available items
MarketplaceItemSchema.index({ regionCode: 1, status: 1 });
// Category filter
MarketplaceItemSchema.index({ category: 1, status: 1 });
// Org's own listings dashboard
MarketplaceItemSchema.index({ organisationId: 1, status: 1 });
// "Community Gives" donation section
MarketplaceItemSchema.index({ isDonation: 1, status: 1 });
// Promoted strip
MarketplaceItemSchema.index({ isPromoted: 1, promotedUntil: 1 });
