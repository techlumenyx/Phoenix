import { GraphQLError } from 'graphql';
import { requirePlatformAdmin } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import { AnnouncementReceiptModel, AuditEventModel, ProductAnnouncementModel } from '../models';

type Audience = 'MEMBER' | 'ORGANISATION' | 'ADMIN';
type Input = {
  releaseKey: string; title: string; summary?: string | null; body: string; audiences: Audience[];
  imageUrl?: string | null; imageAlt?: string | null; videoUrl?: string | null;
  buttonLabel?: string | null; buttonUrl?: string | null;
};

export const productAnnouncementResolvers = {
  Query: {
    currentProductAnnouncement: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const uid = requireUser(ctx);
      await activateScheduled();
      const audience = resolveAnnouncementAudience(ctx);
      const seenIds = await AnnouncementReceiptModel.distinct('announcementId', { firebaseUid: uid });
      const doc = await ProductAnnouncementModel.findOne({
        status: 'PUBLISHED', audiences: audience, _id: { $nin: seenIds },
      }).sort({ publishedAt: -1, publishAt: -1 });
      return doc ? mapDoc(doc) : null;
    },
    myProductAnnouncements: async (_: unknown, args: { limit?: number; offset?: number }, ctx: GraphQLContext) => {
      const uid = requireUser(ctx);
      await activateScheduled();
      const limit = clamp(args.limit, 10, 50); const offset = Math.max(args.offset ?? 0, 0);
      const filter = { status: 'PUBLISHED', audiences: resolveAnnouncementAudience(ctx) };
      const [docs, totalCount, receipts] = await Promise.all([
        ProductAnnouncementModel.find(filter).sort({ publishedAt: -1, publishAt: -1 }).skip(offset).limit(limit),
        ProductAnnouncementModel.countDocuments(filter),
        AnnouncementReceiptModel.find({ firebaseUid: uid }).select('announcementId'),
      ]);
      const seen = new Set(receipts.map((receipt) => receipt.announcementId.toString()));
      return page(docs.map((doc) => ({ ...mapDoc(doc), seen: seen.has(doc._id.toString()) })), totalCount, limit, offset);
    },
    productAnnouncementPage: async (_: unknown, args: { status?: string; audience?: string; search?: string; limit?: number; offset?: number; sortBy?: string; sortDirection?: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']);
      await activateScheduled();
      const limit = clamp(args.limit, 10, 100); const offset = Math.max(args.offset ?? 0, 0);
      const allowedSort = new Set(['createdAt', 'updatedAt', 'publishAt', 'title', 'status', 'releaseKey']);
      const sortBy = allowedSort.has(args.sortBy ?? '') ? args.sortBy as string : 'updatedAt';
      const filter: Record<string, unknown> = {};
      if (args.status) filter['status'] = args.status;
      if (args.audience) filter['audiences'] = args.audience;
      if (args.search?.trim()) {
        const pattern = { $regex: escapeRegex(args.search.trim()), $options: 'i' };
        filter['$or'] = [{ title: pattern }, { releaseKey: pattern }, { summary: pattern }, { body: pattern }];
      }
      const [docs, totalCount] = await Promise.all([
        ProductAnnouncementModel.find(filter).sort({ [sortBy]: args.sortDirection === 'ASC' ? 1 : -1 }).skip(offset).limit(limit),
        ProductAnnouncementModel.countDocuments(filter),
      ]);
      return page(docs.map(mapDoc), totalCount, limit, offset);
    },
  },
  Mutation: {
    markProductAnnouncementSeen: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const uid = requireUser(ctx); await activateScheduled();
      const doc = await ProductAnnouncementModel.findOne({ _id: id, status: 'PUBLISHED', audiences: resolveAnnouncementAudience(ctx) });
      if (!doc) throw notFound();
      await AnnouncementReceiptModel.updateOne({ announcementId: doc._id, firebaseUid: uid }, { $setOnInsert: { seenAt: new Date() } }, { upsert: true });
      return true;
    },
    createProductAnnouncement: async (_: unknown, { input }: { input: Input }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const value = validateAnnouncementInput(input);
      try {
        const doc = await ProductAnnouncementModel.create({ ...value, status: 'DRAFT', createdByFirebaseUid: admin.firebaseUid, updatedByFirebaseUid: admin.firebaseUid });
        await audit(ctx, 'ANNOUNCEMENT_CREATE', doc._id.toString(), `Created ${doc.releaseKey}`, null, 'DRAFT'); return mapDoc(doc);
      } catch (error) { if (isDuplicate(error)) throw badInput('Release key already exists'); throw error; }
    },
    updateProductAnnouncement: async (_: unknown, { id, input }: { id: string; input: Input }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const doc = await ProductAnnouncementModel.findById(id); if (!doc) throw notFound();
      if (doc.status === 'ARCHIVED') throw badInput('Archived announcements cannot be edited');
      const before = doc.status; doc.set({ ...validateAnnouncementInput(input), updatedByFirebaseUid: admin.firebaseUid });
      try { await doc.save(); } catch (error) { if (isDuplicate(error)) throw badInput('Release key already exists'); throw error; }
      await audit(ctx, 'ANNOUNCEMENT_UPDATE', id, `Updated ${doc.releaseKey}`, before, doc.status); return mapDoc(doc);
    },
    publishProductAnnouncement: async (_: unknown, { id, publishAt }: { id: string; publishAt?: Date | string | null }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const doc = await ProductAnnouncementModel.findById(id); if (!doc) throw notFound();
      if (doc.status === 'ARCHIVED') throw badInput('Archived announcements cannot be published');
      const when = publishAt ? new Date(publishAt) : new Date(); if (!Number.isFinite(when.getTime())) throw badInput('Choose a valid publication time');
      const before = doc.status; const scheduled = when.getTime() > Date.now() + 1000;
      doc.status = scheduled ? 'SCHEDULED' : 'PUBLISHED'; doc.publishAt = when; doc.publishedAt = scheduled ? null : new Date(); doc.updatedByFirebaseUid = admin.firebaseUid; await doc.save();
      await audit(ctx, 'ANNOUNCEMENT_PUBLISH', id, scheduled ? `Scheduled ${doc.releaseKey}` : `Published ${doc.releaseKey}`, before, doc.status); return mapDoc(doc);
    },
    archiveProductAnnouncement: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const doc = await ProductAnnouncementModel.findById(id); if (!doc) throw notFound();
      const before = doc.status; doc.status = 'ARCHIVED'; doc.archivedAt = new Date(); doc.updatedByFirebaseUid = admin.firebaseUid; await doc.save();
      await audit(ctx, 'ANNOUNCEMENT_ARCHIVE', id, `Archived ${doc.releaseKey}`, before, 'ARCHIVED'); return mapDoc(doc);
    },
  },
  ProductAnnouncement: {
    seen: async (parent: { id: string; seen?: boolean }, _: unknown, ctx: GraphQLContext) => parent.seen ?? Boolean(ctx.auth.firebaseUid && await AnnouncementReceiptModel.exists({ announcementId: parent.id, firebaseUid: ctx.auth.firebaseUid })),
  },
};

function requireUser(ctx: GraphQLContext) { if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) throw new GraphQLError('Sign in required', { extensions: { code: 'UNAUTHENTICATED' } }); return ctx.auth.firebaseUid; }
export function resolveAnnouncementAudience(ctx: Pick<GraphQLContext, 'auth'>): Audience { const accountType = ctx.auth.decodedToken?.['accountType']; return accountType === 'admin' ? 'ADMIN' : accountType === 'organisation' || typeof ctx.auth.decodedToken?.['orgId'] === 'string' ? 'ORGANISATION' : 'MEMBER'; }
export function validateAnnouncementInput(input: Input) {
  const releaseKey = input.releaseKey.trim().toUpperCase().replace(/[^A-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  if (releaseKey.length < 2 || releaseKey.length > 60) throw badInput('Release key must contain 2–60 letters, numbers, dots, dashes, or underscores');
  const title = input.title.trim(); const body = input.body.trim(); const summary = input.summary?.trim() || null;
  if (!title || title.length > 120) throw badInput('Title is required and must be at most 120 characters');
  if (body.length < 5 || body.length > 6000) throw badInput('Content must contain 5–6000 characters');
  if (summary && summary.length > 240) throw badInput('Summary must be at most 240 characters');
  const audiences = [...new Set(input.audiences)]; if (!audiences.length || audiences.some((item) => !['MEMBER', 'ORGANISATION', 'ADMIN'].includes(item))) throw badInput('Select at least one valid audience');
  if (input.imageUrl) validateUrl(input.imageUrl); if (input.videoUrl) validateUrl(input.videoUrl); if (input.buttonUrl) validateUrl(input.buttonUrl, true);
  if (input.imageUrl && !input.imageAlt?.trim()) throw badInput('Image alt text is required when an image is supplied');
  if (Boolean(input.buttonLabel?.trim()) !== Boolean(input.buttonUrl?.trim())) throw badInput('Button label and destination must be provided together');
  return { ...input, releaseKey, title, body, summary, audiences, imageUrl: input.imageUrl?.trim() || null, imageAlt: input.imageAlt?.trim() || null, videoUrl: input.videoUrl?.trim() || null, buttonLabel: input.buttonLabel?.trim() || null, buttonUrl: input.buttonUrl?.trim() || null };
}
async function activateScheduled() { const now = new Date(); await ProductAnnouncementModel.updateMany({ status: 'SCHEDULED', publishAt: { $lte: now } }, [{ $set: { status: 'PUBLISHED', publishedAt: '$publishAt' } }]); }
function mapDoc<T extends { _id: { toString(): string }; toObject(): object }>(doc: T) { return { ...doc.toObject(), id: doc._id.toString() }; }
function page(edges: unknown[], totalCount: number, limit: number, offset: number) { return { edges, totalCount, hasNextPage: offset + edges.length < totalCount, endCursor: edges.length ? String(offset + edges.length) : null }; }
function clamp(value: number | undefined, fallback: number, max: number) { return Math.min(Math.max(value ?? fallback, 1), max); }
function validateUrl(value: string, allowRelative = false) { if (allowRelative && value.startsWith('/') && !value.startsWith('//')) return; try { const url = new URL(value); if (url.protocol !== 'https:' && !(process.env['NODE_ENV'] !== 'production' && url.hostname === 'localhost')) throw new Error(); } catch { throw badInput('Use a secure HTTPS URL or internal path'); } }
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function badInput(message: string) { return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } }); }
function notFound() { return new GraphQLError('Announcement not found', { extensions: { code: 'NOT_FOUND' } }); }
function isDuplicate(error: unknown) { return Boolean(error && typeof error === 'object' && 'code' in error && error.code === 11000); }
async function audit(ctx: GraphQLContext, action: string, targetId: string, reason: string, beforeStatus: string | null, afterStatus: string | null) { const admin = requirePlatformAdmin(ctx.auth); await AuditEventModel.create({ adminFirebaseUid: admin.firebaseUid, action, targetId, targetType: 'ANNOUNCEMENT', caseId: null, reason, beforeStatus, afterStatus, adminRoles: admin.roles, result: 'SUCCESS', requestId: String(ctx.request.headers['x-request-id'] ?? '') || null, route: String(ctx.request.headers['x-admin-route'] ?? '') || null, ipAddress: ctx.request.ip ?? null, userAgent: String(ctx.request.headers['user-agent'] ?? '') || null }); }
