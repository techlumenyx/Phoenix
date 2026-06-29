import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const EMPLOYMENT_TYPES = [
  'PAID',
  'VOLUNTEER',
  'INTERNSHIP',
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const WORK_LOCATIONS = ['PHYSICAL', 'REMOTE', 'HYBRID'] as const;
export type WorkLocation = (typeof WORK_LOCATIONS)[number];

export const JOB_STATUSES = [
  'ACTIVE',
  'ARCHIVED',
  'CLOSED',
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export interface IJobListing {
  _id: mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;
  createdBy: string;   // firebaseUid of org member who created this listing

  title: string;
  companyDisplayName: string | null;   // override org name on the listing; null = use org name

  employmentType: EmploymentType;
  workLocation:   WorkLocation;
  skillsRequired: string[];
  faithAlignmentTag: 'OPEN_TO_ALL' | 'FAITH_BACKGROUND_PREFERRED' | null;

  region:     string | null;   // display — "Lagos, Nigeria"
  regionCode: string | null;   // filter  — "NG-LA"

  closingDate:  Date;
  salaryMin:    number | null;
  salaryMax:    number | null;
  salaryCurrency: string | null;
  salary:       string | null;   // legacy free-text field

  description:      string;
  responsibilities: string[];   // array of bullet points

  // Requirements — free text fields from creation form
  educationalRequirement: string | null;
  experience:             string | null;
  certifications:         string | null;
  otherSkills:            string | null;

  // Faith Alignment
  faithDescription:     string | null;
  faithAlignedOnly:     boolean;
  keyFaithRequirements: string[];   // tag array — "Active Church Membership" etc.

  // Phase 1 — external redirect; Phase 2 — in-platform form replaces this
  externalApplyUrl: string | null;

  // Platform state
  status:        JobStatus;
  isPromoted:    boolean;
  promotedUntil: Date | null;

  // Denormalized — incremented when a JobApplication is submitted
  applicationCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export type JobListingDocument = HydratedDocument<IJobListing>;

export const JobListingSchema = new Schema<IJobListing>(
  {
    organisationId:     { type: Schema.Types.ObjectId, required: true },
    createdBy:          { type: String,                required: true },

    title:              { type: String, required: true },
    companyDisplayName: { type: String, default: null },

    employmentType:    { type: String, enum: EMPLOYMENT_TYPES, required: true },
    workLocation:      { type: String, enum: WORK_LOCATIONS, required: true },
    skillsRequired:    [{ type: String }],
    faithAlignmentTag: { type: String, default: null },

    region:     { type: String, default: null },
    regionCode: { type: String, default: null },

    closingDate:    { type: Date,   required: true },
    salaryMin:      { type: Number, default: null },
    salaryMax:      { type: Number, default: null },
    salaryCurrency: { type: String, default: null },
    salary:         { type: String, default: null },

    description:      { type: String,   required: true },
    responsibilities: [{ type: String }],

    educationalRequirement: { type: String, default: null },
    experience:             { type: String, default: null },
    certifications:         { type: String, default: null },
    otherSkills:            { type: String, default: null },

    faithDescription:     { type: String,  default: null },
    faithAlignedOnly:     { type: Boolean, default: false },
    keyFaithRequirements: [{ type: String }],

    externalApplyUrl: { type: String, default: null },

    status:        { type: String, enum: JOB_STATUSES, default: 'ACTIVE' },
    isPromoted:    { type: Boolean, default: false },
    promotedUntil: { type: Date,    default: null },

    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Main discovery query — region + active + not expired
JobListingSchema.index({ regionCode: 1, status: 1, closingDate: 1 });
// Org's own listings dashboard
JobListingSchema.index({ organisationId: 1, status: 1 });
// Employment type filter
JobListingSchema.index({ employmentType: 1, status: 1 });
// Auto-archive job — find PUBLISHED listings past their closing date
JobListingSchema.index({ closingDate: 1, status: 1 });
// Promoted strip
JobListingSchema.index({ isPromoted: 1, promotedUntil: 1 });
