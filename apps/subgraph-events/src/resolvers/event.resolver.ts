import { GraphQLError } from 'graphql';
import mongoose, { type HydratedDocument } from 'mongoose';
import { type IEvent } from '../models/event.model';
import { EventModel, RsvpModel } from '../models';
import type { GraphQLContext } from '../context';

type EventDocument = HydratedDocument<IEvent>;

function mapEvent(doc: EventDocument) {
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
    interestedCount: 0,
    savedCount:     0,
    confirmedCount: doc.rsvpCount,
    capacityLimit:  doc.capacity ?? null,
    waitlistCount:  0,
    status:         doc.status,
    imageUrls:      doc.imageUrls ?? [],
    isPromoted:     doc.isPromoted,
    isRecurring:    false,
    seriesId:       null,
    externalTicketUrl: doc.ticketUrl ?? null,
    createdAt:      doc.createdAt,
    updatedAt:      doc.updatedAt,
  };
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
  externalTicketUrl?:  string;
}

interface EventsArgs {
  region?:         string;
  category?:       string;
  organisationId?: string;
  status?:         string;
  limit?:          number;
  after?:          string;
}

export const eventResolvers = {
  Query: {
    event: async (_: unknown, { id }: { id: string }) => {
      const doc = await EventModel.findById(id);
      return doc ? mapEvent(doc) : null;
    },

    events: async (_: unknown, { region, category, organisationId, status, limit = 20, after }: EventsArgs) => {
      const filter: Record<string, unknown> = {};
      if (region)         filter['region'] = region;
      if (category)       filter['category'] = category;
      if (organisationId) filter['organisationId'] = new mongoose.Types.ObjectId(organisationId);
      if (status)         filter['status'] = status;
      if (after)          filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };

      const docs = await EventModel.find(filter).limit(limit + 1).sort({ startDate: -1 });
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapEvent);
      return { edges, hasNextPage, endCursor: edges.length > 0 ? edges[edges.length - 1].id : null };
    },

    featuredEvents: async (_: unknown, { region }: { region?: string }) => {
      const filter: Record<string, unknown> = { isPromoted: true, status: 'PUBLISHED' };
      if (region) filter['region'] = region;
      const docs = await EventModel.find(filter).limit(10).sort({ startDate: 1 });
      return docs.map(mapEvent);
    },

    myRsvps: async (_: unknown, { stage }: { stage?: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) return [];
      const filter: Record<string, unknown> = { userFirebaseUid: ctx.auth.firebaseUid };
      if (stage) filter['stage'] = stage;
      const rsvps = await RsvpModel.find(filter).sort({ createdAt: -1 });
      return rsvps.map((r) => ({
        id:        r._id.toString(),
        event:     { id: r.eventId.toString() },
        user:      { id: ctx.auth.firebaseUid },
        stage:     r.stage,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
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

      const doc = await EventModel.create({
        organisationId:  new mongoose.Types.ObjectId(input.hostOrganisationIds[0]),
        createdBy:       ctx.auth.firebaseUid,
        title:           input.title,
        description:     input.description,
        category:        input.category,
        eventType:       input.location.type,
        location: input.location.type !== 'VIRTUAL' ? {
          address: input.location.address ?? null,
          city:    input.location.city ?? null,
          country: input.location.country ?? null,
        } : null,
        onlineUrl:       input.location.type !== 'PHYSICAL' ? (input.location.virtualLink ?? null) : null,
        region:          input.region,
        startDate:       new Date(input.date),
        endDate:         input.endDate ? new Date(input.endDate) : null,
        capacity:        input.capacityLimit ?? null,
        imageUrls:       input.imageUrls ?? [],
        ticketUrl:       input.externalTicketUrl ?? null,
        status:          'PUBLISHED',
      });

      return mapEvent(doc);
    },

    updateEvent: async (_: unknown, { id, input }: { id: string; input: Partial<CreateEventInput> }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const doc = await EventModel.findOneAndUpdate(
        { _id: id, createdBy: ctx.auth.firebaseUid },
        { $set: { ...(input.title && { title: input.title }), ...(input.description && { description: input.description }) } },
        { new: true },
      );
      if (!doc) throw new GraphQLError('Event not found or access denied', { extensions: { code: 'NOT_FOUND' } });
      return mapEvent(doc);
    },

    deleteEvent: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const result = await EventModel.deleteOne({ _id: id, createdBy: ctx.auth.firebaseUid });
      return result.deletedCount > 0;
    },

    rsvpToEvent: async (_: unknown, { eventId, stage }: { eventId: string; stage: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const rsvp = await RsvpModel.findOneAndUpdate(
        { eventId: new mongoose.Types.ObjectId(eventId), userFirebaseUid: ctx.auth.firebaseUid },
        { $set: { stage } },
        { upsert: true, new: true },
      );
      return {
        id:        rsvp._id.toString(),
        event:     { id: eventId },
        user:      { id: ctx.auth.firebaseUid },
        stage:     rsvp.stage,
        createdAt: rsvp.createdAt,
        updatedAt: rsvp.updatedAt,
      };
    },

    cancelRsvp: async (_: unknown, { eventId }: { eventId: string }, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Unauthorized', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const result = await RsvpModel.deleteOne({
        eventId: new mongoose.Types.ObjectId(eventId),
        userFirebaseUid: ctx.auth.firebaseUid,
      });
      return result.deletedCount > 0;
    },
  },

  Organisation: {
    __resolveReference: async ({ id }: { id: string }) => ({ id }),
    events: async ({ id }: { id: string }, { limit = 20, after }: { limit?: number; after?: string }) => {
      const filter: Record<string, unknown> = { organisationId: new mongoose.Types.ObjectId(id) };
      if (after) filter['_id'] = { $gt: new mongoose.Types.ObjectId(after) };
      const docs = await EventModel.find(filter).limit(limit + 1).sort({ startDate: -1 });
      const hasNextPage = docs.length > limit;
      const edges = docs.slice(0, limit).map(mapEvent);
      return { edges, hasNextPage, endCursor: edges.length > 0 ? edges[edges.length - 1].id : null };
    },
  },

  Event: {
    __resolveReference: async ({ id }: { id: string }) => {
      const doc = await EventModel.findById(id);
      return doc ? mapEvent(doc) : null;
    },
  },

  RSVP: {
    event: async ({ event }: { event: { id: string } }) => {
      const doc = await EventModel.findById(event.id);
      return doc ? mapEvent(doc) : null;
    },
    user: ({ user }: { user: { id: string } }) => user,
  },
};
