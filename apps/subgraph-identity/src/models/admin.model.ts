import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export const ADMIN_ROLES = [
  'SUPER_ADMIN',
  'TRUST_SAFETY',
  'VERIFICATION_REVIEWER',
  'CONTENT_MANAGER',
  'SUPPORT_AGENT',
  'ANALYST',
  'AUDITOR',
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_STATUSES = ['ACTIVE', 'DISABLED'] as const;
export type AdminStatus = (typeof ADMIN_STATUSES)[number];

export interface IAdmin {
  _id: mongoose.Types.ObjectId;
  firebaseUid: string;
  email: string;
  name: string;
  roles: AdminRole[];
  status: AdminStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminDocument = HydratedDocument<IAdmin>;

export const AdminSchema = new Schema<IAdmin>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    roles: [{ type: String, enum: ADMIN_ROLES, required: true }],
    status: { type: String, enum: ADMIN_STATUSES, default: 'ACTIVE' },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

AdminSchema.index({ status: 1 });
