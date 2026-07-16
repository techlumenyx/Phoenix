import mongoose from 'mongoose';
import { EventModel, EventOrganisationNotificationModel, EventSeriesModel } from '../models';

export async function eventDirectory(input: { search?: string; limit?: number; after?: string; id?: string }) {
  const limit = Math.min(Math.max(input.limit ?? 25, 1), 100);
  const filter: Record<string, unknown> = {};
  if (input.id && mongoose.isValidObjectId(input.id)) filter['_id'] = new mongoose.Types.ObjectId(input.id);
  else if (input.after && mongoose.isValidObjectId(input.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(input.after) };
  if (input.search?.trim()) {
    const pattern = { $regex: escapeRegex(input.search.trim()), $options: 'i' };
    filter['$or'] = [{ title: pattern }, { description: pattern }, { region: pattern }];
  }
  const docs = await EventModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
  return {
    items: docs.slice(0, limit).map((doc) => ({ id: doc._id.toString(), type: 'EVENT', title: doc.title, subtitle: doc.seriesId ? `Recurring occurrence ${doc.occurrenceNumber ?? ''}`.trim() : 'Single event', status: doc.status, region: doc.region, ownerFirebaseUid: doc.createdBy, organisationId: doc.organisationId.toString(), seriesId: doc.seriesId?.toString() ?? null, createdAt: doc.createdAt, privateSummary: null })),
    hasNextPage: docs.length > limit,
    endCursor: docs[Math.min(limit, docs.length) - 1]?._id.toString() ?? null,
  };
}

export async function applyAdminEventAction(input: { id: string; action: 'CANCEL' | 'RESTORE'; scope: 'OCCURRENCE' | 'SERIES'; reason: string }) {
  const event = await EventModel.findById(input.id);
  if (!event) return null;
  const status = input.action === 'CANCEL' ? 'CANCELLED' : 'PUBLISHED';
  let changed = 0;
  if (input.scope === 'SERIES' && event.seriesId) {
    const result = await EventModel.updateMany({ seriesId: event.seriesId }, { $set: { status } });
    await EventSeriesModel.updateOne({ _id: event.seriesId }, { $set: { status } });
    changed = result.modifiedCount;
  } else {
    const result = await EventModel.updateOne({ _id: event._id }, { $set: { status } });
    changed = result.modifiedCount;
  }
  await EventOrganisationNotificationModel.updateOne(
    { dedupeKey: `admin-event:${input.action}:${input.scope}:${input.id}` },
    { $setOnInsert: { organisationId: event.organisationId, type: 'ADMIN_ACTION', title: input.action === 'CANCEL' ? 'Event cancelled by platform review' : 'Event restored by platform review', message: input.reason, href: `/events/${event._id}`, sourceId: event._id.toString(), dedupeKey: `admin-event:${input.action}:${input.scope}:${input.id}`, readAt: null } },
    { upsert: true },
  );
  return { changed, status };
}

export async function applyAdminOrganisationEventAction(input: { organisationId: string; action: 'SUSPEND' | 'REACTIVATE' }) {
  if (input.action === 'SUSPEND') {
    const [events, series] = await Promise.all([
      EventModel.updateMany({ organisationId: input.organisationId, adminSuspended: { $ne: true } }, [{ $set: { preAdminStatus: '$status', status: 'CANCELLED', adminSuspended: true } }]),
      EventSeriesModel.updateMany({ organisationId: input.organisationId, adminSuspended: { $ne: true } }, [{ $set: { preAdminStatus: '$status', status: 'CANCELLED', adminSuspended: true } }]),
    ]);
    return { changed: events.modifiedCount + series.modifiedCount };
  }
  const [events, series] = await Promise.all([
    EventModel.updateMany({ organisationId: input.organisationId, adminSuspended: true }, [{ $set: { status: { $ifNull: ['$preAdminStatus', 'DRAFT'] }, adminSuspended: false, preAdminStatus: null } }]),
    EventSeriesModel.updateMany({ organisationId: input.organisationId, adminSuspended: true }, [{ $set: { status: { $ifNull: ['$preAdminStatus', 'DRAFT'] }, adminSuspended: false, preAdminStatus: null } }]),
  ]);
  return { changed: events.modifiedCount + series.modifiedCount };
}

function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
