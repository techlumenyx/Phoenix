import mongoose, { Schema, type HydratedDocument } from 'mongoose';

export interface IAdminCommand {
  _id: mongoose.Types.ObjectId;
  idempotencyKey: string;
  caseId: mongoose.Types.ObjectId;
  targetId: string;
  action: string;
  reason: string;
  requestedByFirebaseUid: string;
  requestId: string | null;
  state: 'PENDING' | 'DOMAIN_APPLIED' | 'COMPLETED' | 'FAILED' | 'REQUIRES_RECONCILIATION';
  canonicalStatus: string | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminCommandDocument = HydratedDocument<IAdminCommand>;

export const AdminCommandSchema = new Schema<IAdminCommand>({
  idempotencyKey: { type: String, required: true, unique: true },
  caseId: { type: Schema.Types.ObjectId, required: true, index: true },
  targetId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  reason: { type: String, required: true, maxlength: 1000 },
  requestedByFirebaseUid: { type: String, required: true, index: true },
  requestId: { type: String, default: null },
  state: { type: String, enum: ['PENDING', 'DOMAIN_APPLIED', 'COMPLETED', 'FAILED', 'REQUIRES_RECONCILIATION'], default: 'PENDING', index: true },
  canonicalStatus: { type: String, default: null },
  failureReason: { type: String, default: null, maxlength: 500 },
}, { timestamps: true });

AdminCommandSchema.index({ state: 1, updatedAt: 1 });
