import mongoose, { Schema } from 'mongoose';

export interface IMediaAsset {
  _id: mongoose.Types.ObjectId;
  cloudinaryAssetId: string;
  publicId: string;
  purpose: string;
  ownerId: string | null;
  uploadedBy: string;
  url: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  posterUrl: string | null;
  status: 'ACTIVE' | 'DELETED';
  createdAt: Date;
  updatedAt: Date;
}

export const MediaAssetSchema = new Schema<IMediaAsset>({
  cloudinaryAssetId: { type: String, required: true, unique: true },
  publicId: { type: String, required: true, unique: true },
  purpose: { type: String, required: true, index: true },
  ownerId: { type: String, default: null, index: true },
  uploadedBy: { type: String, required: true, index: true },
  url: { type: String, required: true },
  resourceType: { type: String, enum: ['image', 'video', 'raw'], required: true },
  format: { type: String, required: true },
  bytes: { type: Number, required: true },
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  duration: { type: Number, default: null },
  posterUrl: { type: String, default: null },
  status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE', index: true },
}, { timestamps: true });

MediaAssetSchema.index({ ownerId: 1, purpose: 1, createdAt: -1 });
