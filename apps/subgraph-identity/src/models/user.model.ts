import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const USER_PREFERENCES = [
  'Worship & Services',
  'Community & Social',
  'Charity & Welfare',
  'Youth & Young Adults',
  'Conferences & Seminars',
  'Career & Volunteering',
  'Marketplace Deals',
  'Music & Creative Arts',
] as const;

export type UserPreference = (typeof USER_PREFERENCES)[number];

export interface IUser {
  _id: mongoose.Types.ObjectId;
  firebaseUid: string;
  email: string;
  name: string;
  region:     string | null;   // display — "London, UK" — set in onboarding step 1
  regionCode: string | null;   // filter  — "GB-LND"    — set in onboarding step 1
  preferences: UserPreference[];
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

export const UserSchema = new Schema<IUser>(
  {
    firebaseUid:         { type: String, required: true, unique: true },
    email:               { type: String, required: true, unique: true },
    name:                { type: String, required: true },
    region:              { type: String, default: null },
    regionCode:          { type: String, default: null },
    preferences:         [{ type: String, enum: USER_PREFERENCES }],
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserSchema.index({ regionCode: 1 });
