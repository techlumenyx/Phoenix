import mongoose, { Schema } from 'mongoose';

export type SavedClassifiedKind = 'JOB' | 'MARKETPLACE';

export interface ISavedClassified {
  _id: mongoose.Types.ObjectId;
  userFirebaseUid: string;
  kind: SavedClassifiedKind;
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const SavedClassifiedSchema = new Schema<ISavedClassified>({
  userFirebaseUid: { type: String, required: true },
  kind: { type: String, enum: ['JOB', 'MARKETPLACE'], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
}, { timestamps: true });

SavedClassifiedSchema.index({ userFirebaseUid: 1, kind: 1, targetId: 1 }, { unique: true });
SavedClassifiedSchema.index({ userFirebaseUid: 1, kind: 1, createdAt: -1 });
