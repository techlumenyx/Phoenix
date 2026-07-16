import mongoose, { Schema, type HydratedDocument } from 'mongoose';
export interface IAuditExport { _id: mongoose.Types.ObjectId; requesterFirebaseUid: string; requesterEmail: string; from: Date; to: Date; status: 'PENDING' | 'READY' | 'FAILED' | 'EXPIRED'; rowCount: number; csvContent: string | null; failureReason: string | null; expiresAt: Date; createdAt: Date; updatedAt: Date }
export type AuditExportDocument = HydratedDocument<IAuditExport>;
export const AuditExportSchema = new Schema<IAuditExport>({
  requesterFirebaseUid: { type: String, required: true, index: true },
  requesterEmail: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'READY', 'FAILED', 'EXPIRED'], default: 'PENDING', index: true },
  rowCount: { type: Number, default: 0 },
  csvContent: { type: String, default: null, select: false },
  failureReason: { type: String, default: null },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
AuditExportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
