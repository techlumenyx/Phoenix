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

// All roles across the platform
export const ROLES = [
  'super_admin',        // platform — full admin dashboard access
  'master_admin',       // org — creator, can delete org
  'site_admin',         // org — full access except deletion
  'events_manager',     // org — events only
  'jobs_manager',       // org — job listings only
  'classifieds_manager', // org — marketplace only
] as const;

export type Role = (typeof ROLES)[number];

// Org-scoped subset — super_admin cannot be assigned via invite
export const ORG_ROLES = [
  'master_admin',
  'site_admin',
  'events_manager',
  'jobs_manager',
  'classifieds_manager',
] as const;

export type OrgRole = (typeof ORG_ROLES)[number];

export interface ISocialLinks {
  whatsapp:  string | null;
  instagram: string | null;
  facebook:  string | null;
  twitter:   string | null;
  website:   string | null;
}

export const PROFILE_VISIBILITIES = ['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE'] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];

export interface IProfilePrivacySettings {
  profileVisibility: ProfileVisibility;
  showAvatar: boolean;
  showRegion: boolean;
  showBio: boolean;
  showSocialLinks: boolean;
}

export interface IUser {
  _id: mongoose.Types.ObjectId;
  firebaseUid: string;
  email: string;
  name: string;
  avatarUrl:   string | null;
  bio:         string | null;
  socialLinks: ISocialLinks | null;
  privacySettings: IProfilePrivacySettings;
  isVerified:  boolean;          // platform-level trust badge, set by admins
  region:     string | null;   // display — "London, UK" — set in onboarding step 1
  regionCode: string | null;   // filter  — "GB-LND"    — set in onboarding step 1
  preferences: UserPreference[];
  onboardingCompleted: boolean;

  // All platform and org roles in one array — [] for regular users
  roles: Role[];

  // Org membership — null/empty if not part of an org
  orgId:        mongoose.Types.ObjectId | null;
  orgInvitedBy: string | null;   // firebaseUid of inviter; null if org creator
  orgJoinedAt:  Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const SocialLinksSchema = new Schema<ISocialLinks>(
  {
    whatsapp:  { type: String, default: null },
    instagram: { type: String, default: null },
    facebook:  { type: String, default: null },
    twitter:   { type: String, default: null },
    website:   { type: String, default: null },
  },
  { _id: false },
);

const ProfilePrivacySettingsSchema = new Schema<IProfilePrivacySettings>(
  {
    profileVisibility: { type: String, enum: PROFILE_VISIBILITIES, default: 'MEMBERS_ONLY' },
    showAvatar: { type: Boolean, default: true },
    showRegion: { type: Boolean, default: true },
    showBio: { type: Boolean, default: true },
    showSocialLinks: { type: Boolean, default: false },
  },
  { _id: false },
);

export const UserSchema = new Schema<IUser>(
  {
    firebaseUid:         { type: String,  required: true, unique: true },
    email:               { type: String,  required: true, unique: true },
    name:                { type: String,  required: true },
    avatarUrl:           { type: String,  default: null },
    bio:                 { type: String,  default: null },
    socialLinks:         { type: SocialLinksSchema, default: null },
    privacySettings:     { type: ProfilePrivacySettingsSchema, default: () => ({}) },
    isVerified:          { type: Boolean, default: false },
    region:              { type: String,  default: null },
    regionCode:          { type: String,  default: null },
    preferences:         [{ type: String, enum: USER_PREFERENCES }],
    onboardingCompleted: { type: Boolean, default: false },

    roles: [{ type: String, enum: ROLES }],

    orgId:        { type: Schema.Types.ObjectId, default: null },
    orgInvitedBy: { type: String, default: null },
    orgJoinedAt:  { type: Date,   default: null },
  },
  { timestamps: true },
);

UserSchema.index({ regionCode: 1 });
UserSchema.index({ orgId: 1 });

