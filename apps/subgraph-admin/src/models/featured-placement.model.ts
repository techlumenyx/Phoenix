import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IFeaturedPlacement {
  _id: mongoose.Types.ObjectId;
  targetType: 'EVENT' | 'JOB' | 'MARKETPLACE_ITEM' | 'ORGANISATION' | 'ANNOUNCEMENT';
  targetId: string | null;
  regions: string[];
  rank: number;
  label: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
  destinationUrl: string;
  startsAt: Date;
  endsAt: Date;
  status: 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  placementSource: 'EDITORIAL' | 'PROMOTION';
  createdByFirebaseUid: string;
  updatedByFirebaseUid: string;
  createdAt: Date;
  updatedAt: Date;
}
export type FeaturedPlacementDocument = HydratedDocument<IFeaturedPlacement>;
export const FeaturedPlacementSchema = new Schema<IFeaturedPlacement>({
  targetType: { type: String, enum: ['EVENT', 'JOB', 'MARKETPLACE_ITEM', 'ORGANISATION', 'ANNOUNCEMENT'], required: true, index: true },
  targetId: { type: String, default: null },
  regions: [{ type: String, required: true }],
  rank: { type: Number, min: 1, max: 100, required: true },
  label: { type: String, required: true, maxlength: 60 },
  title: { type: String, required: true, maxlength: 140 },
  imageUrl: { type: String, default: null, maxlength: 2048 },
  imageAlt: { type: String, default: null, maxlength: 200 },
  destinationUrl: { type: String, required: true, maxlength: 2048 },
  startsAt: { type: Date, required: true, index: true },
  endsAt: { type: Date, required: true, index: true },
  status: { type: String, enum: ['SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED'], default: 'SCHEDULED', index: true },
  placementSource: { type: String, enum: ['EDITORIAL', 'PROMOTION'], default: 'EDITORIAL' },
  createdByFirebaseUid: { type: String, required: true },
  updatedByFirebaseUid: { type: String, required: true },
}, { timestamps: true });
FeaturedPlacementSchema.index({ regions: 1, status: 1, startsAt: 1, endsAt: 1, rank: 1 });
