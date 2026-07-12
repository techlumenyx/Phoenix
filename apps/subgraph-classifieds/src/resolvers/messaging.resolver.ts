import { GraphQLError } from 'graphql';
import mongoose, { type HydratedDocument } from 'mongoose';
import { canAccessOrganisation, getOrganisationAccess } from '@christian-listings/auth';
import { MarketplaceItemModel, MessageModel, MessageThreadModel } from '../models';
import type { IMessageThread } from '../models/message-thread.model';
import type { IMessage } from '../models/message.model';
import type { GraphQLContext } from '../context';
import { mapItem } from './marketplace.resolver';

type ThreadDoc = HydratedDocument<IMessageThread>;
type MessageDoc = HydratedDocument<IMessage>;

function uid(ctx: GraphQLContext) {
  if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) throw new GraphQLError('Sign in to use messaging', { extensions: { code: 'UNAUTHENTICATED' } });
  return ctx.auth.firebaseUid;
}
function validId(id: string) { if (!mongoose.isValidObjectId(id)) throw new GraphQLError('Conversation not found', { extensions: { code: 'NOT_FOUND' } }); return new mongoose.Types.ObjectId(id); }
function orgStaff(ctx: GraphQLContext, orgId: mongoose.Types.ObjectId | null) { return Boolean(orgId && canAccessOrganisation(ctx.auth, orgId.toString(), ['master_admin', 'site_admin', 'classifieds_manager'])); }
function canRead(doc: ThreadDoc, ctx: GraphQLContext) { const viewer = uid(ctx); return viewer === doc.buyerFirebaseUid || viewer === doc.sellerFirebaseUid || orgStaff(ctx, doc.organisationId); }
function mapThread(doc: ThreadDoc, viewer: string) { const sellerView = viewer === doc.sellerFirebaseUid || viewer !== doc.buyerFirebaseUid; return { id: doc._id.toString(), listing: { id: doc.listingId.toString() }, buyer: { firebaseUid: doc.buyerFirebaseUid }, seller: { firebaseUid: doc.sellerFirebaseUid }, organisation: doc.organisationId ? { id: doc.organisationId.toString() } : null, status: doc.status, lastMessage: doc.lastMessageText, lastMessageAt: doc.lastMessageAt, unreadCount: sellerView ? doc.sellerUnreadCount : doc.buyerUnreadCount, createdAt: doc.createdAt, updatedAt: doc.updatedAt }; }
function mapMessage(doc: MessageDoc) { return { id: doc._id.toString(), thread: { id: doc.threadId.toString() }, sender: { firebaseUid: doc.senderFirebaseUid }, type: doc.type, body: doc.deletedAt ? 'Message removed' : doc.body, readAt: doc.readAt, createdAt: doc.createdAt }; }
function cleanBody(body: string) { const value = body.trim(); if (!value) throw new GraphQLError('Message cannot be empty', { extensions: { code: 'BAD_USER_INPUT' } }); if (value.length > 2000) throw new GraphQLError('Message must be 2,000 characters or fewer', { extensions: { code: 'BAD_USER_INPUT' } }); return value; }

export const messagingResolvers = {
  Query: {
    myMessageThreads: async (_: unknown, { role, limit = 30, after }: { role?: 'BUYER' | 'SELLER'; limit?: number; after?: string }, ctx: GraphQLContext) => {
      const viewer = uid(ctx); const access = getOrganisationAccess(ctx.auth); const choices: Record<string, unknown>[] = [];
      if (role !== 'SELLER') choices.push({ buyerFirebaseUid: viewer });
      if (role !== 'BUYER') { choices.push({ sellerFirebaseUid: viewer }); if (access?.orgId) choices.push({ organisationId: new mongoose.Types.ObjectId(access.orgId) }); }
      const filter: Record<string, unknown> = { $or: choices }; if (after) filter['_id'] = { $lt: validId(after) };
      const docs = await MessageThreadModel.find(filter).sort({ lastMessageAt: -1, _id: -1 }).limit(Math.min(limit, 50) + 1); const hasNextPage = docs.length > Math.min(limit, 50); const page = docs.slice(0, Math.min(limit, 50));
      return { edges: page.map((doc) => mapThread(doc, viewer)), hasNextPage, endCursor: page.at(-1)?._id.toString() ?? null };
    },
    messageThread: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => { const doc = await MessageThreadModel.findById(validId(id)); if (!doc || !canRead(doc, ctx)) return null; return mapThread(doc, uid(ctx)); },
    unreadMessageCount: async (_: unknown, __: unknown, ctx: GraphQLContext) => { const viewer = uid(ctx); const access = getOrganisationAccess(ctx.auth); const buyer = await MessageThreadModel.aggregate([{ $match: { buyerFirebaseUid: viewer } }, { $group: { _id: null, total: { $sum: '$buyerUnreadCount' } } }]); const sellerFilter: Record<string, unknown>[] = [{ sellerFirebaseUid: viewer }]; if (access?.orgId) sellerFilter.push({ organisationId: new mongoose.Types.ObjectId(access.orgId) }); const seller = await MessageThreadModel.aggregate([{ $match: { $or: sellerFilter } }, { $group: { _id: null, total: { $sum: '$sellerUnreadCount' } } }]); return (buyer[0]?.total ?? 0) + (seller[0]?.total ?? 0); },
  },
  Mutation: {
    startListingConversation: async (_: unknown, { listingId, message }: { listingId: string; message: string }, ctx: GraphQLContext) => {
      const buyer = uid(ctx); const listing = await MarketplaceItemModel.findById(validId(listingId)); if (!listing) throw new GraphQLError('Listing not found', { extensions: { code: 'NOT_FOUND' } });
      if (listing.createdBy === buyer || (listing.organisationId && orgStaff(ctx, listing.organisationId))) throw new GraphQLError('You cannot message your own listing', { extensions: { code: 'BAD_USER_INPUT' } });
      const body = cleanBody(message); let thread = await MessageThreadModel.findOne({ listingId: listing._id, buyerFirebaseUid: buyer, sellerFirebaseUid: listing.createdBy });
      if (!thread) thread = await MessageThreadModel.create({ listingId: listing._id, buyerFirebaseUid: buyer, sellerFirebaseUid: listing.createdBy, organisationId: listing.organisationId, status: 'ACTIVE' });
      if (thread.status === 'BLOCKED') throw new GraphQLError('This conversation is unavailable', { extensions: { code: 'FORBIDDEN' } });
      const sent = await MessageModel.create({ threadId: thread._id, senderFirebaseUid: buyer, type: 'TEXT', body }); thread.status = 'ACTIVE'; thread.lastMessageText = body; thread.lastMessageAt = sent.createdAt; thread.lastMessageSenderUid = buyer; thread.sellerUnreadCount += 1; await thread.save(); return mapThread(thread, buyer);
    },
    sendMessage: async (_: unknown, { threadId, body }: { threadId: string; body: string }, ctx: GraphQLContext) => { const viewer = uid(ctx); const thread = await MessageThreadModel.findById(validId(threadId)); if (!thread || !canRead(thread, ctx)) throw new GraphQLError('Conversation not found', { extensions: { code: 'NOT_FOUND' } }); if (thread.status !== 'ACTIVE') throw new GraphQLError('This conversation is not active', { extensions: { code: 'BAD_USER_INPUT' } }); const text = cleanBody(body); const sent = await MessageModel.create({ threadId: thread._id, senderFirebaseUid: viewer, type: 'TEXT', body: text }); const buyerSending = viewer === thread.buyerFirebaseUid; thread.lastMessageText = text; thread.lastMessageAt = sent.createdAt; thread.lastMessageSenderUid = viewer; if (buyerSending) thread.sellerUnreadCount += 1; else thread.buyerUnreadCount += 1; await thread.save(); return mapMessage(sent); },
    markThreadRead: async (_: unknown, { threadId }: { threadId: string }, ctx: GraphQLContext) => { const viewer = uid(ctx); const thread = await MessageThreadModel.findById(validId(threadId)); if (!thread || !canRead(thread, ctx)) throw new GraphQLError('Conversation not found', { extensions: { code: 'NOT_FOUND' } }); const sellerView = viewer === thread.sellerFirebaseUid || viewer !== thread.buyerFirebaseUid; if (sellerView) thread.sellerUnreadCount = 0; else thread.buyerUnreadCount = 0; await thread.save(); await MessageModel.updateMany({ threadId: thread._id, senderFirebaseUid: { $ne: viewer }, readAt: null }, { $set: { readAt: new Date() } }); return true; },
    archiveThread: async (_: unknown, { threadId }: { threadId: string }, ctx: GraphQLContext) => { const thread = await MessageThreadModel.findById(validId(threadId)); if (!thread || !canRead(thread, ctx)) throw new GraphQLError('Conversation not found', { extensions: { code: 'NOT_FOUND' } }); thread.status = 'ARCHIVED'; await thread.save(); return mapThread(thread, uid(ctx)); },
  },
  MessageThread: {
    listing: async ({ listing }: { listing: { id: string } }) => { const doc = await MarketplaceItemModel.findById(listing.id); return doc ? mapItem(doc) : null; },
    messages: async ({ id }: { id: string }, { limit = 50, before }: { limit?: number; before?: string }, ctx: GraphQLContext) => { const thread = await MessageThreadModel.findById(id); if (!thread || !canRead(thread, ctx)) throw new GraphQLError('Conversation not found', { extensions: { code: 'NOT_FOUND' } }); const filter: Record<string, unknown> = { threadId: thread._id }; if (before) filter['_id'] = { $lt: validId(before) }; const docs = await MessageModel.find(filter).sort({ _id: -1 }).limit(Math.min(limit, 100) + 1); const hasNextPage = docs.length > Math.min(limit, 100); const page = docs.slice(0, Math.min(limit, 100)); return { edges: page.reverse().map(mapMessage), hasNextPage, endCursor: page.at(-1)?._id.toString() ?? null }; },
  },
  Message: {},
};
