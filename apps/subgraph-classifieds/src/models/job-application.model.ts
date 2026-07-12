import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const APPLICATION_STATUSES = [
  'SUBMITTED',
  'SHORTLISTED',
  'UNDER_REVIEW',
  'REJECTED',
  'HIRED',
  'WITHDRAWN',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface IEducationEntry {
  highestQualification: string | null;
  institutionName:       string | null;
  yearOfEnrollment:      number | null;
  yearOfCompletion:      number | null;
  marksGrades:           string | null;
  degreeType:            string | null;
}

export interface IJobApplication {
  _id: mongoose.Types.ObjectId;
  jobId:          mongoose.Types.ObjectId;
  organisationId: mongoose.Types.ObjectId;   // denormalized for org dashboard queries
  applicantFirebaseUid: string;

  // Personal details — captured at submission time, not linked live to User profile
  fullName:    string;
  phoneNumber: string | null;
  email:       string;
  gender:      string | null;
  dateOfBirth: Date | null;

  // Education — repeatable entries
  education: IEducationEntry[];

  // Professional experience
  experienceDescription: string | null;
  yearsOfExperience:     number | null;
  currentSalary:         string | null;   // free text
  expectedSalary:        string | null;   // free text

  // Documents
  cvUrl:          string | null;   // Cloudinary URL
  portfolioUrl:   string | null;
  linkedInProfile: string | null;

  acknowledged: boolean;

  status: ApplicationStatus;

  createdAt: Date;
  updatedAt: Date;
}

export type JobApplicationDocument = HydratedDocument<IJobApplication>;

const EducationEntrySchema = new Schema<IEducationEntry>(
  {
    highestQualification: { type: String, default: null },
    institutionName:      { type: String, default: null },
    yearOfEnrollment:     { type: Number, default: null },
    yearOfCompletion:     { type: Number, default: null },
    marksGrades:          { type: String, default: null },
    degreeType:           { type: String, default: null },
  },
  { _id: false },
);

export const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId:                { type: Schema.Types.ObjectId, required: true },
    organisationId:       { type: Schema.Types.ObjectId, required: true },
    applicantFirebaseUid: { type: String,                required: true },

    fullName:    { type: String, required: true },
    phoneNumber: { type: String, default: null },
    email:       { type: String, required: true },
    gender:      { type: String, default: null },
    dateOfBirth: { type: Date,   default: null },

    education: [EducationEntrySchema],

    experienceDescription: { type: String, default: null },
    yearsOfExperience:     { type: Number, default: null },
    currentSalary:         { type: String, default: null },
    expectedSalary:        { type: String, default: null },

    cvUrl:           { type: String, default: null },
    portfolioUrl:    { type: String, default: null },
    linkedInProfile: { type: String, default: null },

    acknowledged: { type: Boolean, default: false },

    status: {
      type:    String,
      enum:    APPLICATION_STATUSES,
      default: 'SUBMITTED',
    },
  },
  { timestamps: true },
);

// One application per user per job
JobApplicationSchema.index({ jobId: 1, applicantFirebaseUid: 1 }, { unique: true });
// Org dashboard — all applications for a specific job, filterable by status
JobApplicationSchema.index({ jobId: 1, status: 1 });
// Org dashboard — across all jobs
JobApplicationSchema.index({ organisationId: 1, status: 1 });
// Candidate's "My Applications" page
JobApplicationSchema.index({ applicantFirebaseUid: 1 });
