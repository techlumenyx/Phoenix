import mongoose from 'mongoose';
import { getFirebaseAdmin } from '@christian-listings/auth';
import { IdentityOrganisationNotificationModel, OrganisationModel, UserModel } from '../models';

export type VerificationDecision = 'APPROVE' | 'REJECT' | 'NEEDS_INFORMATION';

export async function applyVerificationDecision(input: {
  organisationId: string;
  submissionId: string;
  action: VerificationDecision;
  tier: 'NONE' | 'STANDARD' | 'CHARITY' | 'NGO';
  reason: string;
}) {
  const status = input.action === 'APPROVE' ? 'VERIFIED' : input.action === 'REJECT' ? 'REJECTED' : 'PENDING_SUBMISSION';
  const organisation = await OrganisationModel.findByIdAndUpdate(input.organisationId, {
    $set: { verificationStatus: status, verificationTier: input.action === 'APPROVE' ? input.tier : 'NONE' },
  }, { new: true });
  if (!organisation) return null;
  const title = input.action === 'APPROVE' ? 'Verification approved' : input.action === 'REJECT' ? 'Verification declined' : 'More verification information needed';
  await IdentityOrganisationNotificationModel.updateOne(
    { dedupeKey: `verification:${input.submissionId}:${input.action}` },
    { $setOnInsert: {
      organisationId: organisation._id,
      type: 'VERIFICATION_UPDATE',
      title,
      message: input.reason,
      href: '/org/settings',
      sourceId: input.submissionId,
      dedupeKey: `verification:${input.submissionId}:${input.action}`,
      readAt: null,
    } },
    { upsert: true },
  );
  return { status, verificationTier: organisation.verificationTier };
}

export async function identityDirectory(input: { type: 'USER' | 'ORGANISATION'; search?: string; limit?: number; after?: string; id?: string }) {
  const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);
  const filter: Record<string, unknown> = {};
  if (input.id && mongoose.isValidObjectId(input.id)) filter['_id'] = new mongoose.Types.ObjectId(input.id);
  if (input.after && mongoose.isValidObjectId(input.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(input.after) };
  const pattern = input.search?.trim() ? { $regex: escapeRegex(input.search.trim()), $options: 'i' } : null;
  if (pattern) filter['$or'] = input.type === 'USER' ? [{ name: pattern }, { email: pattern }, { firebaseUid: pattern }] : [{ name: pattern }, { region: pattern }, { createdBy: pattern }];
  const docs = input.type === 'USER'
    ? await UserModel.find(filter).sort({ _id: -1 }).limit(limit + 1)
    : await OrganisationModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
  return {
    items: docs.slice(0, limit).map((value) => {
      const doc = value.toObject() as unknown as Record<string, unknown> & { _id: mongoose.Types.ObjectId };
      return input.type === 'USER' ? {
        id: doc._id.toString(), type: 'USER', title: String(doc['name'] ?? ''), subtitle: 'Member account',
        status: String(doc['accountStatus'] ?? 'ACTIVE'), region: doc['region'] ?? null, ownerFirebaseUid: doc['firebaseUid'],
        organisationId: doc['orgId']?.toString() ?? null, createdAt: doc['createdAt'], privateSummary: `Email: ${String(doc['email'] ?? '')}`,
      } : {
        id: doc._id.toString(), type: 'ORGANISATION', title: String(doc['name'] ?? ''), subtitle: String(doc['organisationType'] ?? 'Organisation'),
        status: doc['isActive'] === false ? 'SUSPENDED' : String(doc['verificationStatus'] ?? 'PENDING_SUBMISSION'), region: doc['region'] ?? null,
        ownerFirebaseUid: doc['createdBy'], organisationId: doc._id.toString(), createdAt: doc['createdAt'],
        privateSummary: `Contact: ${String(doc['contactEmail'] ?? 'Not supplied')}`,
      };
    }),
    hasNextPage: docs.length > limit,
    endCursor: docs.length ? docs[Math.min(limit, docs.length) - 1]._id.toString() : null,
  };
}

export async function applyIdentityAccountAction(input: { type: 'USER' | 'ORGANISATION'; id: string; action: 'WARN' | 'SUSPEND' | 'REACTIVATE'; reason: string }) {
  if (input.type === 'USER') {
    const existing = await UserModel.findById(input.id);
    if (!existing) return null;
    if (input.action === 'SUSPEND') {
      const auth = getFirebaseAdmin().auth();
      await auth.updateUser(existing.firebaseUid, { disabled: true });
      await auth.revokeRefreshTokens(existing.firebaseUid);
    }
    const update = input.action === 'WARN' ? { $inc: { warningCount: 1 } } : { $set: { accountStatus: input.action === 'SUSPEND' ? 'SUSPENDED' : 'ACTIVE', suspensionReason: input.action === 'SUSPEND' ? input.reason : null } };
    const user = await UserModel.findByIdAndUpdate(input.id, update, { new: true });
    if (user && input.action === 'REACTIVATE') await getFirebaseAdmin().auth().updateUser(user.firebaseUid, { disabled: false });
    return user ? { status: user.accountStatus, warningCount: user.warningCount } : null;
  }
  const update = input.action === 'WARN'
    ? { $inc: { warningCount: 1 } }
    : { $set: { isActive: input.action !== 'SUSPEND', deactivatedAt: input.action === 'SUSPEND' ? new Date() : null } };
  const organisation = await OrganisationModel.findByIdAndUpdate(input.id, update, { new: true });
  if (organisation) {
    const dedupeKey = `admin-account:${input.action}:${organisation._id}:${input.action === 'WARN' ? organisation.warningCount : organisation.updatedAt.getTime()}`;
    await IdentityOrganisationNotificationModel.updateOne(
      { dedupeKey },
      { $setOnInsert: { organisationId: organisation._id, type: 'ACCOUNT_UPDATE', title: input.action === 'WARN' ? 'Platform warning' : input.action === 'SUSPEND' ? 'Organisation suspended' : 'Organisation reactivated', message: input.reason, href: '/org/settings', sourceId: organisation._id.toString(), dedupeKey, readAt: null } },
      { upsert: true },
    );
  }
  return organisation ? { status: organisation.isActive ? 'ACTIVE' : 'SUSPENDED', warningCount: organisation.warningCount } : null;
}

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
