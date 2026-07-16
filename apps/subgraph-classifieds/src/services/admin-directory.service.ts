import mongoose from 'mongoose';
import { JobListingModel, MarketplaceItemModel } from '../models';

export async function classifiedsDirectory(input: { type: 'JOB' | 'MARKETPLACE_ITEM'; search?: string; limit?: number; after?: string; id?: string }) {
  const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);
  const filter: Record<string, unknown> = {};
  if (input.id && mongoose.isValidObjectId(input.id)) filter['_id'] = new mongoose.Types.ObjectId(input.id);
  else if (input.after && mongoose.isValidObjectId(input.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(input.after) };
  if (input.search?.trim()) {
    const pattern = { $regex: escapeRegex(input.search.trim()), $options: 'i' };
    filter['$or'] = input.type === 'JOB' ? [{ title: pattern }, { companyDisplayName: pattern }, { region: pattern }] : [{ title: pattern }, { description: pattern }, { region: pattern }];
  }
  const docs = input.type === 'JOB'
    ? await JobListingModel.find(filter).sort({ _id: -1 }).limit(limit + 1)
    : await MarketplaceItemModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
  return {
    items: docs.slice(0, limit).map((value) => {
      const doc = value.toObject() as unknown as Record<string, unknown> & { _id: mongoose.Types.ObjectId };
      return { id: doc._id.toString(), type: input.type, title: String(doc['title'] ?? ''), subtitle: input.type === 'JOB' ? String(doc['companyDisplayName'] ?? 'Job listing') : String(doc['category'] ?? 'Marketplace listing'), status: String(doc['status'] ?? ''), region: doc['region'] ?? null, ownerFirebaseUid: doc['createdBy'], organisationId: doc['organisationId']?.toString() ?? null, seriesId: null, createdAt: doc['createdAt'], privateSummary: null };
    }),
    hasNextPage: docs.length > limit,
    endCursor: docs[Math.min(limit, docs.length) - 1]?._id.toString() ?? null,
  };
}

export async function applyAdminOrganisationClassifiedsAction(input: { organisationId: string; action: 'SUSPEND' | 'REACTIVATE' }) {
  if (input.action === 'SUSPEND') {
    const [jobs, listings] = await Promise.all([
      JobListingModel.updateMany({ organisationId: input.organisationId, adminSuspended: { $ne: true } }, [{ $set: { preAdminStatus: '$status', status: 'ARCHIVED', adminSuspended: true } }]),
      MarketplaceItemModel.updateMany({ organisationId: input.organisationId, adminSuspended: { $ne: true } }, [{ $set: { preAdminStatus: '$status', status: 'REMOVED', adminSuspended: true } }]),
    ]);
    return { changed: jobs.modifiedCount + listings.modifiedCount };
  }
  const [jobs, listings] = await Promise.all([
    JobListingModel.updateMany({ organisationId: input.organisationId, adminSuspended: true }, [{ $set: { status: { $ifNull: ['$preAdminStatus', 'ARCHIVED'] }, adminSuspended: false, preAdminStatus: null } }]),
    MarketplaceItemModel.updateMany({ organisationId: input.organisationId, adminSuspended: true }, [{ $set: { status: { $ifNull: ['$preAdminStatus', 'REMOVED'] }, adminSuspended: false, preAdminStatus: null } }]),
  ]);
  return { changed: jobs.modifiedCount + listings.modifiedCount };
}

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
