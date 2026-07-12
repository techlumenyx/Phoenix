import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const RSVP_STAGES = [
  'INTERESTED',   // soft signal — no commitment
  'SAVED',        // bookmarked — user intends to attend
  'CONFIRMED',    // firm attendance — triggers rsvpCount $inc
  'WAITLISTED',
] as const;

export type RsvpStage = (typeof RSVP_STAGES)[number];

export interface IRsvp {
  _id: mongoose.Types.ObjectId;
  eventId:         mongoose.Types.ObjectId;
  userFirebaseUid: string;
  stage:           RsvpStage;
  createdAt: Date;
  updatedAt: Date;
}

export type RsvpDocument = HydratedDocument<IRsvp>;

export const RsvpSchema = new Schema<IRsvp>(
  {
    eventId:         { type: Schema.Types.ObjectId, required: true },
    userFirebaseUid: { type: String,                required: true },
    stage: {
      type:     String,
      enum:     RSVP_STAGES,
      required: true,
    },
  },
  { timestamps: true },
);

// One RSVP per user per event — stage mutates in-place
RsvpSchema.index({ eventId: 1, userFirebaseUid: 1 }, { unique: true });
// Confirmed attendees list + waitlist promotion query
RsvpSchema.index({ eventId: 1, stage: 1 });
// "My RSVPs" — all events a user has interacted with, filterable by stage
RsvpSchema.index({ userFirebaseUid: 1, stage: 1 });
