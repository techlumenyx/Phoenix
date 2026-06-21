import mongoose, { Schema, type HydratedDocument } from 'mongoose';
import { type OrgRole, ORG_ROLES } from './user.model.js';

export const INVITE_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'EXPIRED',
  'REVOKED',
] as const;

export type InviteStatus = (typeof INVITE_STATUSES)[number];

export interface IOrgInvite {
  _id: mongoose.Types.ObjectId;
  email: string;                          // invitee's email address
  organisationId: mongoose.Types.ObjectId;
  roles: OrgRole[];                       // roles to grant on acceptance
  invitedBy: string;                      // firebaseUid of the inviter
  token: string;                          // unique UUID used in the invite link
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrgInviteDocument = HydratedDocument<IOrgInvite>;

export const OrgInviteSchema = new Schema<IOrgInvite>(
  {
    email:          { type: String,              required: true },
    organisationId: { type: Schema.Types.ObjectId, required: true },
    roles:          [{ type: String, enum: ORG_ROLES }],
    invitedBy:      { type: String,              required: true },
    token:          { type: String,              required: true, unique: true },
    status: {
      type:    String,
      enum:    INVITE_STATUSES,
      default: 'PENDING',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);


// Prevent duplicate PENDING invites for the same person to the same org.
// Partial filter means accepted/expired/revoked invites don't block re-inviting.
OrgInviteSchema.index(
  { email: 1, organisationId: 1 },
  { unique: true, partialFilterExpression: { status: 'PENDING' } },
);
// Useful for listing all pending invites for an org (member management page)
OrgInviteSchema.index({ organisationId: 1, status: 1 });
