import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IAuditEvent {
  _id: mongoose.Types.ObjectId;
  adminFirebaseUid: string;
  action: string;
  targetId: string;
  targetType: 'MARKETPLACE_ITEM' | 'ORGANISATION_VERIFICATION' | 'USER' | 'ORGANISATION' | 'EVENT' | 'JOB' | 'AUDIT_EXPORT' | 'TEMPLATE' | 'FEATURED_PLACEMENT' | 'SAVED_VIEW';
  caseId: mongoose.Types.ObjectId | null;
  reason: string;
  beforeStatus: string | null;
  afterStatus: string | null;
  requestId: string | null;
  adminRoles: string[];
  result: 'SUCCESS' | 'FAILED';
  route: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export type AuditEventDocument = HydratedDocument<IAuditEvent>;

export const AuditEventSchema = new Schema<IAuditEvent>(
  {
    adminFirebaseUid: { type: String, required: true, index: true },
    action: { type: String, required: true },
    targetId: { type: String, required: true },
    targetType: { type: String, enum: ['MARKETPLACE_ITEM', 'ORGANISATION_VERIFICATION', 'USER', 'ORGANISATION', 'EVENT', 'JOB', 'AUDIT_EXPORT', 'TEMPLATE', 'FEATURED_PLACEMENT', 'SAVED_VIEW'], required: true },
    caseId: { type: Schema.Types.ObjectId, default: null, index: true },
    reason: { type: String, required: true, maxlength: 1000 },
    beforeStatus: { type: String, default: null },
    afterStatus: { type: String, default: null },
    requestId: { type: String, default: null },
    adminRoles: [{ type: String }],
    result: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
    route: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuditEventSchema.index({ createdAt: -1 });
AuditEventSchema.index({ targetType: 1, action: 1, result: 1, createdAt: -1 });
AuditEventSchema.index({ requestId: 1 }, { sparse: true });
