import mongoose, { Schema, type HydratedDocument } from 'mongoose';
import { RSVP_STAGES, type RsvpStage } from './rsvp.model';

export interface ISeriesRsvp {
  _id: mongoose.Types.ObjectId;
  seriesId: mongoose.Types.ObjectId;
  userFirebaseUid: string;
  stage: RsvpStage;
  excludedEventIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type SeriesRsvpDocument = HydratedDocument<ISeriesRsvp>;

export const SeriesRsvpSchema = new Schema<ISeriesRsvp>({
  seriesId: { type: Schema.Types.ObjectId, required: true },
  userFirebaseUid: { type: String, required: true },
  stage: { type: String, enum: RSVP_STAGES, required: true },
  excludedEventIds: [{ type: Schema.Types.ObjectId }],
}, { timestamps: true });

SeriesRsvpSchema.index({ seriesId: 1, userFirebaseUid: 1 }, { unique: true });
SeriesRsvpSchema.index({ userFirebaseUid: 1, updatedAt: -1 });
