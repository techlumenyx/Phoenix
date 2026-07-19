import { GraphQLError } from 'graphql';
import mongoose, { type HydratedDocument } from 'mongoose';
import { type IEvent } from '../models/event.model';
import { type IEventSeries, type IRecurrenceRule } from '../models/event-series.model';
import { EventModel, EventOrganisationNotificationModel, EventSeriesModel, RsvpModel, SeriesRsvpModel } from '../models';
import type { GraphQLContext } from '../context';
import { canAccessOrganisation, getOrganisationAccess } from '@christian-listings/auth';
import { generateOccurrenceDates } from '../lib/recurrence';
import { resolveLocationRegion } from '@christian-listings/utils';

type EventDocument = HydratedDocument<IEvent>;

interface EventCounts { interested: number; saved: number; confirmed: number; waitlisted: number }

function mapEvent(doc: EventDocument, counts?: EventCounts) {
  return {
    id:             doc._id.toString(),
    title:          doc.title,
    description:    doc.description,
    category:       doc.category,
    date:           doc.startDate,
    endDate:        doc.endDate ?? null,
    location: {
      type:         doc.eventType,
      address:      doc.location?.address ?? null,
      city:         doc.location?.city ?? null,
      country:      doc.location?.country ?? null,
      virtualLink:  doc.onlineUrl ?? null,
    },
    hosts:          [{ id: doc.organisationId.toString() }],
    region:         doc.region ?? '',
    rsvpCount:      doc.rsvpCount,
    interestedCount: counts?.interested ?? 0,
    savedCount:     counts?.saved ?? 0,
    confirmedCount: counts?.confirmed ?? doc.rsvpCount,
    capacityLimit:  doc.capacity ?? null,
    waitlistCount:  counts?.waitlisted ?? 0,
    status:         doc.status,
    imageUrls:      doc.imageUrls ?? [],
    isPromoted:     doc.isPromoted,
    isRecurring:    Boolean(doc.seriesId),
    seriesId:       doc.seriesId?.toString() ?? null,
    occurrenceNumber: doc.occurrenceNumber ?? null,
    originalDate: doc.originalStartDate ?? null,
    isSeriesException: doc.isSeriesException ?? false,
    series: doc.seriesId ? { id: doc.seriesId.toString() } : null,
    externalTicketUrl: doc.ticketUrl ?? null,
    createdAt:      doc.createdAt,
    updatedAt:      doc.updatedAt,
  };
}

function mapSeries(doc: HydratedDocument<IEventSeries>) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    recurrence: doc.recurrence,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function mapSeriesRsvp(doc: InstanceType<typeof SeriesRsvpModel>) {
  return {
    id: doc._id.toString(),
    series: { id: doc.seriesId.toString() },
    user: { firebaseUid: doc.userFirebaseUid },
    stage: doc.stage,
    excludedEventIds: doc.excludedEventIds.map((id) => id.toString()),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

interface RecurrenceInput {
  frequency: 'WEEKLY' | 'MONTHLY';
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  timezone: string;
  endsAt?: string;
  occurrenceCount?: number;
}

interface CreateEventInput {
  title:               string;
  description:         string;
  category:            string;
  date:                string;
  endDate?:            string;
  location: {
    type:         string;
    address?:     string;
    city?:        string;
    country?:     string;
    virtualLink?: string;
  };
  hostOrganisationIds: string[];
  region:              string;
  capacityLimit?:      number;
  imageUrls?:          string[];
  isRecurring?:        boolean;
  recurrence?:         RecurrenceInput;
  externalTicketUrl?:  string;
}

interface EventsArgs {
  region?:         string;
  search?:         string;
  category?:       string;
  organisationId?: string;
  status?:         string;
  dateFrom?:       string;
  dateTo?:         string;
  locationType?:   string;
  ticketed?:       boolean;
  sort?:           string;
  limit?:          number;
  after?:          string;
  collapseSeries?: boolean;
}

function recurrenceRule(input: RecurrenceInput): IRecurrenceRule {
  return {
    frequency: input.frequency,
    interval: input.interval ?? 1,
    daysOfWeek: input.frequency === 'WEEKLY' ? (input.daysOfWeek?.length ? input.daysOfWeek : []) : [],
    dayOfMonth: input.frequency === 'MONTHLY' ? (input.dayOfMonth ?? null) : null,
    timezone: input.timezone,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
    occurrenceCount: input.occurrenceCount ?? null,
  };
}

function eventLocation(input: CreateEventInput['location']) {
  return input.type !== 'VIRTUAL' ? {
    address: input.address ?? null,
    city: input.city ?? null,
    country: input.country ?? null,
  } : null;
}

function eventUpdate(input: Partial<CreateEventInput>) {
  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update['title'] = input.title;
  if (input.description !== undefined) update['description'] = input.description;
  if (input.category !== undefined) update['category'] = input.category;
  if (input.date !== undefined) update['startDate'] = new Date(input.date);
  if (input.endDate !== undefined) update['endDate'] = input.endDate ? new Date(input.endDate) : null;
  if (input.location !== undefined) {
    update['eventType'] = input.location.type;
    update['location'] = eventLocation(input.location);
    update['onlineUrl'] = input.location.type !== 'PHYSICAL' ? input.location.virtualLink ?? null : null;
  }
  if (input.region !== undefined) {
    const region = resolveLocationRegion(input.region);
    update['region'] = region?.displayName ?? input.region.trim();
    update['regionCode'] = region?.code ?? null;
  }
  if (input.capacityLimit !== undefined) update['capacity'] = input.capacityLimit;
  if (input.imageUrls !== undefined) update['imageUrls'] = input.imageUrls;
  if (input.externalTicketUrl !== undefined) {
    update['ticketUrl'] = input.externalTicketUrl;
    update['isTicketed'] = Boolean(input.externalTicketUrl);
  }
  if ((input as { status?: string }).status !== undefined) update['status'] = (input as { status?: string }).status;
  return update;
}

function requireEventManager(ctx: GraphQLContext) {
  if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
  const access = getOrganisationAccess(ctx.auth);
  if (!access || !access.roles.some((role) => ['master_admin', 'site_admin', 'events_manager'].includes(role))) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
  return access;
}

async function writeMilestone(event: EventDocument, confirmedCount: number | null) {
  if (!confirmedCount || ![10, 25, 50, 100, 250, 500, 1000].includes(confirmedCount)) return;
  await EventOrganisationNotificationModel.updateOne(
    { dedupeKey: `rsvp:${event._id}:${confirmedCount}` },
    { $setOnInsert: { organisationId: event.organisationId, type: 'RSVP_MILESTONE', title: 'RSVP milestone reached', message: `${event.title} has reached ${confirmedCount} confirmed RSVPs.`, href: '/org/events', sourceId: event._id.toString(), dedupeKey: `rsvp:${event._id}:${confirmedCount}`, readAt: null } },
    { upsert: true },
  );
}

async function upsertOccurrenceRsvp(event: EventDocument, userFirebaseUid: string, requestedStage: string, source: 'OCCURRENCE' | 'SERIES', seriesRsvpId?: mongoose.Types.ObjectId) {
  const existing = await RsvpModel.findOne({ eventId: event._id, userFirebaseUid });
  if (source === 'SERIES' && existing?.source === 'OCCURRENCE') return existing;
  let resolvedStage = requestedStage;
  const wasConfirmed = existing?.stage === 'CONFIRMED';
  let reservedConfirmedPlace = false;
  let confirmedCount: number | null = null;
  if (requestedStage === 'CONFIRMED' && !wasConfirmed) {
    const capacityFilter = event.capacity == null ? { _id: event._id } : { _id: event._id, $expr: { $lt: ['$rsvpCount', '$capacity'] } };
    const reservedEvent = await EventModel.findOneAndUpdate(capacityFilter, { $inc: { rsvpCount: 1 } }, { new: true });
    if (reservedEvent) { reservedConfirmedPlace = true; confirmedCount = reservedEvent.rsvpCount; }
    else resolvedStage = 'WAITLISTED';
  }
  let rsvp;
  try {
    rsvp = await RsvpModel.findOneAndUpdate(
      { eventId: event._id, userFirebaseUid },
      { $set: { stage: resolvedStage, source, seriesRsvpId: source === 'SERIES' ? seriesRsvpId ?? null : null } },
      { upsert: true, new: true },
    );
  } catch (error) {
    if (reservedConfirmedPlace) await EventModel.updateOne({ _id: event._id }, { $inc: { rsvpCount: -1 } });
    throw error;
  }
  if (wasConfirmed && resolvedStage !== 'CONFIRMED') await EventModel.updateOne({ _id: event._id }, { $inc: { rsvpCount: -1 } });
  await writeMilestone(event, confirmedCount);
  return rsvp;
}

async function removeOccurrenceRsvp(eventId: mongoose.Types.ObjectId, userFirebaseUid: string) {
  const existing = await RsvpModel.findOne({ eventId, userFirebaseUid });
  if (!existing) return false;
  await RsvpModel.deleteOne({ _id: existing._id });
  if (existing.stage === 'CONFIRMED') {
    const promoted = await RsvpModel.findOneAndUpdate({ eventId, stage: 'WAITLISTED' }, { $set: { stage: 'CONFIRMED' } }, { sort: { createdAt: 1 }, new: true });
    if (!promoted) await EventModel.updateOne({ _id: eventId }, { $inc: { rsvpCount: -1 } });
  }
  return true;
}

export const eventResolvers = {
  Query: {
    event: async (_: unknown, { id }: { id: string }) => {
      const doc = await EventModel.findById(id);
      if (!doc) return null;
      const grouped = await RsvpModel.aggregate<{ _id: string; count: number }>([
        { $match: { eventId: doc._id } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]);
      const count = (stage: string) => grouped.find((entry) => entry._id === stage)?.count ?? 0;
      return mapEvent(doc, { interested: count('INTERESTED'), saved: count('SAVED'), confirmed: count('CONFIRMED'), waitlisted: count('WAITLISTED') });
    },

    events: async (_: unknown, { region, search, category, organisationId, status, dateFrom, dateTo, locationType, ticketed, sort = 'DATE_ASC', limit = 20, after, collapseSeries = false }: EventsArgs) => {
      const filter: Record<string, unknown> = {};
      if (region) {
        const resolved = resolveLocationRegion(region);
        if (resolved) filter['$and'] = [{ $or: [{ region: resolved.displayName }, { regionCode: { $in: resolved.codes } }] }];
      }
      if (search?.trim()) {
        const pattern = { $regex: escapeRegex(search.trim()), $options: 'i' };
        filter['$and'] = [...((filter['$and'] as unknown[]) ?? []), { $or: [{ title: pattern }, { description: pattern }] }];
      }
      if (category)       filter['category'] = category;
      if (organisationId) filter['organisationId'] = new mongoose.Types.ObjectId(organisationId);
      if (status)         filter['status'] = status;
      if (dateFrom || dateTo) filter['startDate'] = { ...(dateFrom && { $gte: new Date(dateFrom) }), ...(dateTo && { $lte: new Date(dateTo) }) };
      if (locationType)   filter['eventType'] = locationType;
      if (ticketed !== undefined) filter['isTicketed'] = ticketed;
      if (after)          filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };

      const sortBy: Record<string, 1 | -1> = sort === 'NEWEST' ? { createdAt: -1 } : sort === 'POPULAR' ? { rsvpCount: -1 } : { startDate: 1 };
      const docs = await EventModel.find(filter).limit(collapseSeries ? Math.min(limit * 6, 600) : limit + 1).sort(sortBy);
      const visibleDocs = collapseSeries ? docs.filter((doc, index, all) => !doc.seriesId || all.findIndex((candidate) => candidate.seriesId?.toString() === doc.seriesId?.toString()) === index) : docs;
      const hasNextPage = visibleDocs.length > limit || (collapseSeries && docs.length === Math.min(limit * 6, 600));
      const edges = visibleDocs.slice(0, limit).map((doc) => mapEvent(doc));
      return { edges, hasNextPage, endCursor: edges.length > 0 ? edges[edges.length - 1].id : null };
    },

    featuredEvents: async (_: unknown, { region }: { region?: string }) => {
      const filter: Record<string, unknown> = { isPromoted: true, status: 'PUBLISHED' };
      if (region) {
        const resolved = resolveLocationRegion(region);
        if (resolved) filter['$or'] = [{ region: resolved.displayName }, { regionCode: { $in: resolved.codes } }];
      }
      const docs = await EventModel.find(filter).limit(10).sort({ startDate: 1 });
      return docs.map((doc) => mapEvent(doc));
    },

    myRsvps: async (_: unknown, { stage }: { stage?: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) return [];
      const filter: Record<string, unknown> = { userFirebaseUid: ctx.auth.firebaseUid };
      if (stage) filter['stage'] = stage;
      const rsvps = await RsvpModel.find(filter).sort({ createdAt: -1 });
      return rsvps.map((r) => ({
        id:        r._id.toString(),
        event:     { id: r.eventId.toString() },
        user:      { firebaseUid: ctx.auth.firebaseUid },
        stage:     r.stage,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    },

    eventSeries: async (_: unknown, { id }: { id: string }) => {
      const doc = await EventSeriesModel.findById(id);
      return doc ? mapSeries(doc) : null;
    },

    mySeriesRsvp: async (_: unknown, { seriesId }: { seriesId: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) return null;
      const doc = await SeriesRsvpModel.findOne({ seriesId: new mongoose.Types.ObjectId(seriesId), userFirebaseUid: ctx.auth.firebaseUid });
      return doc ? mapSeriesRsvp(doc) : null;
    },
  },

  Mutation: {
    createEvent: async (_: unknown, { input }: { input: CreateEventInput }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      if (!input.hostOrganisationIds[0]) {
        throw new GraphQLError('hostOrganisationIds must contain at least one ID', { extensions: { code: 'BAD_REQUEST' } });
      }
      if (!canAccessOrganisation(ctx.auth, input.hostOrganisationIds[0], ['master_admin', 'site_admin', 'events_manager'])) {
        throw new GraphQLError('You cannot create events for this organisation', { extensions: { code: 'FORBIDDEN' } });
      }

      const organisationId = new mongoose.Types.ObjectId(input.hostOrganisationIds[0]);
      const startDate = new Date(input.date);
      const endDate = input.endDate ? new Date(input.endDate) : null;
      const region = resolveLocationRegion(input.region);
      const shared = {
        organisationId,
        createdBy: ctx.auth.firebaseUid,
        title: input.title,
        description: input.description,
        category: input.category,
        eventType: input.location.type,
        location: eventLocation(input.location),
        onlineUrl: input.location.type !== 'PHYSICAL' ? input.location.virtualLink ?? null : null,
        region: region?.displayName ?? input.region.trim(),
        regionCode: region?.code ?? null,
        capacity: input.capacityLimit ?? null,
        imageUrls: input.imageUrls ?? [],
        ticketUrl: input.externalTicketUrl ?? null,
        isTicketed: Boolean(input.externalTicketUrl),
        status: 'PUBLISHED' as const,
      };

      if (input.isRecurring) {
        if (!input.recurrence) throw new GraphQLError('Recurrence settings are required', { extensions: { code: 'BAD_USER_INPUT' } });
        let recurrence: IRecurrenceRule;
        let dates: Date[];
        try {
          recurrence = recurrenceRule(input.recurrence);
          dates = generateOccurrenceDates(startDate, recurrence);
        } catch (error) {
          throw new GraphQLError(error instanceof Error ? error.message : 'Invalid recurrence settings', { extensions: { code: 'BAD_USER_INPUT' } });
        }
        if (!dates.length) throw new GraphQLError('The recurrence rule does not produce any occurrences', { extensions: { code: 'BAD_USER_INPUT' } });
        const series = await EventSeriesModel.create({ ...shared, startDate, endDate, recurrence });
        const duration = endDate ? Math.max(0, endDate.getTime() - startDate.getTime()) : null;
        try {
          const occurrences = await EventModel.insertMany(dates.map((date, index) => ({
            ...shared,
            startDate: date,
            endDate: duration === null ? null : new Date(date.getTime() + duration),
            seriesId: series._id,
            occurrenceNumber: index + 1,
            originalStartDate: date,
            isSeriesException: false,
            overriddenFields: [],
          })));
          return mapEvent(occurrences[0] as EventDocument);
        } catch (error) {
          await EventSeriesModel.deleteOne({ _id: series._id });
          throw error;
        }
      }

      const doc = await EventModel.create({ ...shared, startDate, endDate });
      return mapEvent(doc);
    },

    updateEvent: async (_: unknown, { id, input, scope = 'THIS_OCCURRENCE' }: { id: string; input: Partial<CreateEventInput>; scope?: string }, ctx: GraphQLContext) => {
      const access = requireEventManager(ctx);
      const organisationId = new mongoose.Types.ObjectId(access.orgId);
      const current = await EventModel.findOne({ _id: id, organisationId });
      if (!current) throw new GraphQLError('Event not found or access denied', { extensions: { code: 'NOT_FOUND' } });
      const update = eventUpdate(input);
      if (!current.seriesId || scope === 'THIS_OCCURRENCE') {
        const doc = await EventModel.findByIdAndUpdate(current._id, { $set: { ...update, ...(current.seriesId && { isSeriesException: true }) }, ...(current.seriesId && { $addToSet: { overriddenFields: { $each: Object.keys(update) } } }) }, { new: true });
        return mapEvent(doc!);
      }

      const threshold = scope === 'THIS_AND_FUTURE' ? current.startDate : new Date();
      await EventModel.updateOne({ _id: current._id }, { $set: update });
      await EventModel.updateMany(
        { seriesId: current.seriesId, organisationId, startDate: { $gte: threshold }, _id: { $ne: current._id }, isSeriesException: { $ne: true } },
        { $set: update },
      );
      await EventSeriesModel.updateOne({ _id: current.seriesId, organisationId }, { $set: update });
      const refreshed = await EventModel.findById(current._id);
      return mapEvent(refreshed!);
    },

    cancelEvent: async (_: unknown, { id, scope = 'THIS_OCCURRENCE' }: { id: string; scope?: string }, ctx: GraphQLContext) => {
      const access = requireEventManager(ctx);
      const organisationId = new mongoose.Types.ObjectId(access.orgId);
      const current = await EventModel.findOne({ _id: id, organisationId });
      if (!current) throw new GraphQLError('Event not found or access denied', { extensions: { code: 'NOT_FOUND' } });
      if (!current.seriesId || scope === 'THIS_OCCURRENCE') {
        await EventModel.updateOne({ _id: current._id }, { $set: { status: 'CANCELLED', ...(current.seriesId && { isSeriesException: true }) } });
        return true;
      }
      const threshold = scope === 'THIS_AND_FUTURE' ? current.startDate : new Date();
      await EventModel.updateMany({ seriesId: current.seriesId, organisationId, startDate: { $gte: threshold } }, { $set: { status: 'CANCELLED' } });
      if (scope === 'ENTIRE_SERIES') await EventSeriesModel.updateOne({ _id: current.seriesId, organisationId }, { $set: { status: 'CANCELLED' } });
      return true;
    },

    deleteEvent: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const access = getOrganisationAccess(ctx.auth);
      if (!access || !access.roles.some((role) => ['master_admin', 'site_admin', 'events_manager'].includes(role))) throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
      const result = await EventModel.deleteOne({ _id: id, organisationId: new mongoose.Types.ObjectId(access.orgId) });
      return result.deletedCount > 0;
    },

    rsvpToEvent: async (_: unknown, { eventId, stage }: { eventId: string; stage: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const event = await EventModel.findById(eventId);
      if (!event || event.status !== 'PUBLISHED') throw new GraphQLError('Event is not accepting RSVPs', { extensions: { code: 'BAD_USER_INPUT' } });
      const rsvp = await upsertOccurrenceRsvp(event, ctx.auth.firebaseUid, stage, 'OCCURRENCE');
      return {
        id:        rsvp._id.toString(),
        event:     { id: eventId },
        user:      { firebaseUid: ctx.auth.firebaseUid },
        stage:     rsvp.stage,
        createdAt: rsvp.createdAt,
        updatedAt: rsvp.updatedAt,
      };
    },

    cancelRsvp: async (_: unknown, { eventId }: { eventId: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const eventObjectId = new mongoose.Types.ObjectId(eventId);
      const existing = await RsvpModel.findOne({ eventId: eventObjectId, userFirebaseUid: ctx.auth.firebaseUid });
      if (existing?.source === 'SERIES' && existing.seriesRsvpId) await SeriesRsvpModel.updateOne({ _id: existing.seriesRsvpId }, { $addToSet: { excludedEventIds: eventObjectId } });
      return removeOccurrenceRsvp(eventObjectId, ctx.auth.firebaseUid);
    },

    rsvpToSeries: async (_: unknown, { seriesId, stage }: { seriesId: string; stage: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const series = await EventSeriesModel.findById(seriesId);
      if (!series || series.status !== 'PUBLISHED') throw new GraphQLError('Event series is not accepting RSVPs', { extensions: { code: 'BAD_USER_INPUT' } });
      const seriesRsvp = await SeriesRsvpModel.findOneAndUpdate(
        { seriesId: series._id, userFirebaseUid: ctx.auth.firebaseUid },
        { $set: { stage }, $setOnInsert: { excludedEventIds: [] } },
        { upsert: true, new: true },
      );
      const excluded = new Set(seriesRsvp.excludedEventIds.map((id) => id.toString()));
      const occurrences = await EventModel.find({ seriesId: series._id, status: 'PUBLISHED', startDate: { $gte: new Date() } }).sort({ startDate: 1 });
      for (const occurrence of occurrences) {
        if (!excluded.has(occurrence._id.toString())) await upsertOccurrenceRsvp(occurrence, ctx.auth.firebaseUid, stage, 'SERIES', seriesRsvp._id);
      }
      return mapSeriesRsvp(seriesRsvp);
    },

    cancelSeriesRsvp: async (_: unknown, { seriesId }: { seriesId: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      const seriesRsvp = await SeriesRsvpModel.findOne({ seriesId: new mongoose.Types.ObjectId(seriesId), userFirebaseUid: ctx.auth.firebaseUid });
      if (!seriesRsvp) return false;
      const future = await RsvpModel.find({ seriesRsvpId: seriesRsvp._id, source: 'SERIES' });
      const futureEventIds = await EventModel.find({ _id: { $in: future.map((rsvp) => rsvp.eventId) }, startDate: { $gte: new Date() } }).select('_id');
      for (const event of futureEventIds) await removeOccurrenceRsvp(event._id, ctx.auth.firebaseUid);
      await SeriesRsvpModel.deleteOne({ _id: seriesRsvp._id });
      return true;
    },
  },

  Organisation: {
    __resolveReference: async ({ id }: { id: string }) => ({ id }),
    events: async ({ id }: { id: string }, { limit = 20, after }: { limit?: number; after?: string }) => {
      const filter: Record<string, unknown> = { organisationId: new mongoose.Types.ObjectId(id) };
      if (after) filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };
      const docs = await EventModel.find(filter).limit(limit + 1).sort({ startDate: -1 });
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map((doc) => mapEvent(doc));
      return { edges, hasNextPage, endCursor: edges.length > 0 ? edges[edges.length - 1].id : null };
    },
  },

  Event: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await EventModel.findById(id);
      return doc ? mapEvent(doc) : null;
    },
    series: async ({ seriesId }: { seriesId?: string | null }) => {
      if (!seriesId) return null;
      const doc = await EventSeriesModel.findById(seriesId);
      return doc ? mapSeries(doc) : null;
    },
    mySeriesRsvp: async ({ seriesId }: { seriesId?: string | null }, _: unknown, ctx: GraphQLContext) => {
      if (!seriesId || !ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) return null;
      const doc = await SeriesRsvpModel.findOne({ seriesId: new mongoose.Types.ObjectId(seriesId), userFirebaseUid: ctx.auth.firebaseUid });
      return doc ? mapSeriesRsvp(doc) : null;
    },
  },

  EventSeries: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await EventSeriesModel.findById(id);
      return doc ? mapSeries(doc) : null;
    },
    occurrences: async ({ id }: { id: string }, { limit = 20, after }: { limit?: number; after?: string }) => {
      const filter: Record<string, unknown> = { seriesId: new mongoose.Types.ObjectId(id) };
      if (after) filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };
      const docs = await EventModel.find(filter).sort({ startDate: 1 }).limit(limit + 1);
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map((doc) => mapEvent(doc));
      return { edges, hasNextPage, endCursor: edges.at(-1)?.id ?? null };
    },
  },

  SeriesRSVP: {
    series: ({ series }: { series: { id: string } }) => series,
    user: ({ user }: { user: { firebaseUid: string } }) => user,
  },

  RSVP: {
    event: async ({ event }: { event: { id: string } }) => {
      const doc = await EventModel.findById(event.id);
      return doc ? mapEvent(doc) : null;
    },
    user: ({ user }: { user: { firebaseUid: string } }) => user,
  },
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
