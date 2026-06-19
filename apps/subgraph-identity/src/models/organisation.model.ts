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

export interface IOrganisation {
  _id: mongoose.Types.ObjectId;
  firebaseUid: string;   // links to the organisation's Firebase Auth account
  // Step 1 — mandatory
  phoneNumber: string;
  // Step 2 — skippable
  name:             string | null;
  organisationType: OrganisationType | null;
  missionStatement: string | null;
  region:           string | null;   // display — "London, UK"
  regionCode:       string | null;   // filter  — "GB-LND"
  // Step 3 — skippable
  verificationDetails: IVerificationDetails;
  // Platform state
  verificationStatus:  VerificationStatus;
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

export const OrganisationSchema = new Schema<IOrganisation>(
  {
    firebaseUid:  { type: String, required: true, unique: true },
    phoneNumber:  { type: String, required: true },

    name:             { type: String, default: null },
    organisationType: { type: String, enum: ORGANISATION_TYPES, default: null },
    missionStatement: { type: String, default: null },
    region:           { type: String, default: null },
    regionCode:       { type: String, default: null },

    verificationDetails: { type: VerificationDetailsSchema, default: () => ({}) },

    verificationStatus: {
      type:    String,
      enum:    VERIFICATION_STATUSES,
      default: 'PENDING_SUBMISSION',
    },
    onboardingCompleted: { type: Boolean, default: false },
    followerCount:       { type: Number,  default: 0 },
  },
  { timestamps: true },
);

OrganisationSchema.index({ regionCode: 1 });
OrganisationSchema.index({ verificationStatus: 1 });

// Derived trust badge — true when admin has approved verification
OrganisationSchema.virtual('isVerified').get(function () {
  return this.verificationStatus === 'VERIFIED';
});
