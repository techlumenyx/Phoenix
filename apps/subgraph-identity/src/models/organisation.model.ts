import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const ORGANISATION_TYPES = [
  'Church',
  'Charity',
  'NGO',
  'Social Enterprise',
  'Other',
] as const;

export type OrganisationType = (typeof ORGANISATION_TYPES)[number];

export const VERIFICATION_STATUSES = [
  'PENDING_SUBMISSION',
  'PENDING_REVIEW',
  'VERIFIED',
  'REJECTED',
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export interface IVerificationDetails {
  officialName:       string | null;
  registrationNumber: string | null;
  officialEmail:      string | null;
  pocName:            string | null;
  pocTitle:           string | null;
  documentUrls:       string[];
}

export const VERIFICATION_TIERS = ['NONE', 'STANDARD', 'CHARITY', 'NGO'] as const;
export type VerificationTier = (typeof VERIFICATION_TIERS)[number];

export interface ISocialLinks {
  whatsapp:  string | null;
  instagram: string | null;
  facebook:  string | null;
  twitter:   string | null;
  website:   string | null;
}

export interface IOrganisation {
  _id: mongoose.Types.ObjectId;
  createdBy: string;   // firebaseUid of the master_admin (user who created the org)
  // Step 1 — optional for schema-driven creation
  phoneNumber: string | null;
  // Core fields
  name:             string | null;
  description:      string | null;
  logoUrl:          string | null;
  websiteUrl:       string | null;
  socialLinks:      ISocialLinks | null;
  organisationType: OrganisationType | null;
  region:           string | null;   // display — "London, UK"
  regionCode:       string | null;   // filter  — "GB-LND"
  // Verification
  verificationDetails: IVerificationDetails;
  verificationStatus:  VerificationStatus;
  verificationTier:    VerificationTier;
  isVerified:          boolean;   // virtual — derived from verificationStatus
  onboardingCompleted: boolean;
  followerCount:       number;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganisationDocument = HydratedDocument<IOrganisation>;

const VerificationDetailsSchema = new Schema<IVerificationDetails>(
  {
    officialName:       { type: String, default: null },
    registrationNumber: { type: String, default: null },
    officialEmail:      { type: String, default: null },
    pocName:            { type: String, default: null },
    pocTitle:           { type: String, default: null },
    documentUrls:       [{ type: String }],
  },
  { _id: false },
);

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

export const OrganisationSchema = new Schema<IOrganisation>(
  {
    createdBy:   { type: String, required: true },
    phoneNumber: { type: String, default: null },

    name:             { type: String, default: null },
    description:      { type: String, default: null },
    logoUrl:          { type: String, default: null },
    websiteUrl:       { type: String, default: null },
    socialLinks:      { type: SocialLinksSchema, default: null },
    organisationType: { type: String, enum: ORGANISATION_TYPES, default: null },
    region:           { type: String, default: null },
    regionCode:       { type: String, default: null },

    verificationDetails: { type: VerificationDetailsSchema, default: () => ({}) },

    verificationStatus: {
      type:    String,
      enum:    VERIFICATION_STATUSES,
      default: 'PENDING_SUBMISSION',
    },
    verificationTier: {
      type:    String,
      enum:    VERIFICATION_TIERS,
      default: 'NONE',
    },
    onboardingCompleted: { type: Boolean, default: false },
    followerCount:       { type: Number,  default: 0 },
  },
  { timestamps: true },
);

OrganisationSchema.index({ createdBy: 1 });
OrganisationSchema.index({ regionCode: 1 });
OrganisationSchema.index({ verificationStatus: 1 });

// Derived trust badge — true when admin has approved verification
OrganisationSchema.virtual('isVerified').get(function () {
  return this.verificationStatus === 'VERIFIED';
});

