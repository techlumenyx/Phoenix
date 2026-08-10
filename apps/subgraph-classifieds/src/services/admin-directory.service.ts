import mongoose from 'mongoose';
import { JobListingModel, MarketplaceItemModel } from '../models';

export async function classifiedsDirectory(input: { type: 'JOB' | 'MARKETPLACE_ITEM'; search?: string; limit?: number; after?: string; offset?: number; sortBy?: string; sortDirection?: 'ASC' | 'DESC'; id?: string }) {
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 100);
  const offset = Math.max(input.offset ?? 0, 0);
  const filter: Record<string, unknown> = {};
  if (input.id && mongoose.isValidObjectId(input.id)) filter['_id'] = new mongoose.Types.ObjectId(input.id);
  else if (input.offset == null && input.after && mongoose.isValidObjectId(input.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(input.after) };
  if (input.search?.trim()) {
    const pattern = { $regex: escapeRegex(input.search.trim()), $options: 'i' };
    filter['$or'] = input.type === 'JOB' ? [{ title: pattern }, { companyDisplayName: pattern }, { region: pattern }] : [{ title: pattern }, { description: pattern }, { region: pattern }];
  }
  const sortFields = { title: 'title', status: 'status', region: 'region', createdAt: 'createdAt' };
  const sortField = sortFields[input.sortBy as keyof typeof sortFields] ?? 'createdAt';
  const direction = input.sortDirection === 'ASC' ? 1 : -1;
  const sort = { [sortField]: direction, _id: direction } as Record<string, 1 | -1>;
  const [docs, totalCount] = await Promise.all(input.type === 'JOB'
    ? [JobListingModel.find(filter).sort(sort).skip(offset).limit(limit), JobListingModel.countDocuments(filter)]
    : [MarketplaceItemModel.find(filter).sort(sort).skip(offset).limit(limit), MarketplaceItemModel.countDocuments(filter)]);
  return {
    items: docs.map((value) => {
      const doc = value.toObject() as unknown as Record<string, unknown> & { _id: mongoose.Types.ObjectId };
      return { id: doc._id.toString(), type: input.type, title: String(doc['title'] ?? ''), subtitle: input.type === 'JOB' ? String(doc['companyDisplayName'] ?? 'Job listing') : String(doc['category'] ?? 'Marketplace listing'), status: String(doc['status'] ?? ''), region: doc['region'] ?? null, ownerFirebaseUid: doc['createdBy'], organisationId: doc['organisationId']?.toString() ?? null, seriesId: null, createdAt: doc['createdAt'], privateSummary: null };
    }),
    totalCount,
    hasNextPage: offset + docs.length < totalCount,
    endCursor: docs.at(-1)?._id.toString() ?? null,
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
