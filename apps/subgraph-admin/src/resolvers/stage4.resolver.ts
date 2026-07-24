import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { requirePlatformAdmin } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import {
  AdminNotificationModel,
  AdminCommandModel,
  AdminTemplateModel,
  AuditEventModel,
  AuditExportModel,
  FeaturedPlacementModel,
  SavedAdminViewModel,
  VerificationSubmissionModel,
} from '../models';
import type { AdminTemplateDocument } from '../models/admin-template.model';
import type { AuditExportDocument } from '../models/audit-export.model';
import type { FeaturedPlacementDocument } from '../models/featured-placement.model';
import type { SavedAdminViewDocument } from '../models/saved-admin-view.model';
import type { AdminNotificationDocument } from '../models/admin-notification.model';
import { audit, internalPost, notifyAdmin } from './verification.resolver';

type PlacementInput = {
  targetType: 'EVENT' | 'JOB' | 'MARKETPLACE_ITEM' | 'ORGANISATION' | 'ANNOUNCEMENT'; targetId?: string | null;
  regions: string[]; rank: number; label: string; title: string; imageUrl?: string | null; imageAlt?: string | null;
  destinationUrl: string; startsAt: Date | string; endsAt: Date | string; placementSource?: 'EDITORIAL' | 'PROMOTION';
};

export const stage4Resolvers = {
  Query: {
    auditEvents: async (_: unknown, args: { caseId?: string; adminFirebaseUid?: string; targetType?: string; action?: string; result?: string; from?: Date | string; to?: Date | string; limit?: number; after?: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, ['AUDITOR', 'TRUST_SAFETY']);
      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100);
      const filter: Record<string, unknown> = {};
      if (args.caseId && mongoose.isValidObjectId(args.caseId)) filter['caseId'] = args.caseId;
      if (args.adminFirebaseUid) filter['adminFirebaseUid'] = args.adminFirebaseUid;
      if (args.targetType) filter['targetType'] = args.targetType;
      if (args.action) filter['action'] = args.action;
      if (args.result) filter['result'] = args.result;
      addDateFilter(filter, args.from, args.to);
      if (args.after && mongoose.isValidObjectId(args.after)) filter['_id'] = { $lt: new mongoose.Types.ObjectId(args.after) };
      const docs = await AuditEventModel.find(filter).sort({ _id: -1 }).limit(limit + 1);
      return { edges: docs.slice(0, limit).map(mapDoc), hasNextPage: docs.length > limit, endCursor: docs[Math.min(limit, docs.length) - 1]?._id.toString() ?? null };
    },
    auditExports: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['AUDITOR', 'TRUST_SAFETY']);
      return (await AuditExportModel.find({ requesterFirebaseUid: admin.firebaseUid }).sort({ createdAt: -1 }).limit(25)).map(mapDoc);
    },
    auditExportContent: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['AUDITOR']);
      const doc = await AuditExportModel.findOne({ _id: id, requesterFirebaseUid: admin.firebaseUid }).select('+csvContent');
      if (!doc || doc.status !== 'READY' || doc.expiresAt <= new Date() || !doc.csvContent) throw new GraphQLError('Audit export is unavailable or expired', { extensions: { code: 'NOT_FOUND' } });
      await audit(ctx, admin.firebaseUid, 'DOWNLOAD_AUDIT_EXPORT', doc._id.toString(), 'AUDIT_EXPORT', `Downloaded audit export containing ${doc.rowCount} rows`);
      return doc.csvContent;
    },
    adminTemplates: async (_: unknown, { type, activeOnly = false }: { type?: string; activeOnly?: boolean }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, ['TRUST_SAFETY', 'VERIFICATION_REVIEWER', 'SUPPORT_AGENT', 'CONTENT_MANAGER', 'AUDITOR']);
      const filter: Record<string, unknown> = {};
      if (type) filter['type'] = type;
      if (activeOnly) filter['active'] = true;
      return (await AdminTemplateModel.find(filter).sort({ key: 1, locale: 1, version: -1 })).map(mapDoc);
    },
    featuredPlacements: async (_: unknown, { status, region }: { status?: string; region?: string }, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER', 'AUDITOR']);
      await refreshPlacementStatuses();
      const filter: Record<string, unknown> = {};
      if (status) filter['status'] = status;
      if (region) filter['regions'] = { $in: ['GLOBAL', region] };
      return (await FeaturedPlacementModel.find(filter).sort({ rank: 1, startsAt: 1 })).map(mapDoc);
    },
    savedAdminViews: async (_: unknown, { module }: { module?: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth);
      const filter: Record<string, unknown> = { ownerFirebaseUid: admin.firebaseUid };
      if (module) filter['module'] = module;
      return (await SavedAdminViewModel.find(filter).sort({ name: 1 })).map(mapDoc);
    },
    adminNotifications: async (_: unknown, { unreadOnly = false, limit = 25 }: { unreadOnly?: boolean; limit?: number }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth);
      await refreshSlaNotifications(admin.firebaseUid);
      const filter: Record<string, unknown> = { recipientFirebaseUid: admin.firebaseUid };
      if (unreadOnly) filter['readAt'] = null;
      return (await AdminNotificationModel.find(filter).sort({ createdAt: -1 }).limit(Math.min(Math.max(limit, 1), 100))).map(mapDoc);
    },
    adminNotificationUnreadCount: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth);
      await refreshSlaNotifications(admin.firebaseUid);
      return AdminNotificationModel.countDocuments({ recipientFirebaseUid: admin.firebaseUid, readAt: null });
    },
    adminSystemHealth: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requirePlatformAdmin(ctx.auth, ['AUDITOR']);
      const checkedAt = new Date();
      const unresolvedCommands = await AdminCommandModel.countDocuments({ state: 'REQUIRES_RECONCILIATION' });
      const services = await Promise.all([
        checkHttp('Identity subgraph', process.env['IDENTITY_INTERNAL_URL'] ?? 'http://localhost:4001'),
        checkHttp('Events subgraph', process.env['EVENTS_INTERNAL_URL'] ?? 'http://localhost:4002'),
        checkHttp('Classifieds subgraph', process.env['CLASSIFIEDS_INTERNAL_URL'] ?? 'http://localhost:4003'),
      ]);
      const dependencies = [
        { name: 'Admin MongoDB', category: 'DATABASE', status: AuditEventModel.db.readyState === 1 ? 'OPERATIONAL' : 'DEGRADED', detail: AuditEventModel.db.readyState === 1 ? 'Connected' : `Connection state ${AuditEventModel.db.readyState}`, latencyMs: null, checkedAt },
        ...services.map((service) => ({ ...service, checkedAt })),
        provider('Firebase Admin', 'IDENTITY', Boolean(process.env['FIREBASE_SERVICE_ACCOUNT_JSON']), checkedAt),
        provider('Cloudinary', 'MEDIA', Boolean(process.env['CLOUDINARY_CLOUD_NAME']), checkedAt, 'Optional until direct uploads are enabled'),
        provider('Transactional email', 'MESSAGING', process.env['EMAIL_ENABLED'] === 'true' && Boolean(process.env['SENDGRID_WEBHOOK_PUBLIC_KEY']), checkedAt, process.env['EMAIL_ENABLED'] === 'true' ? 'SendGrid delivery enabled' : 'Delivery disabled; email intents are suppressed safely'),
        { name: 'Command reconciliation', category: 'WORKFLOW', status: unresolvedCommands ? 'DOWN' : 'OPERATIONAL', detail: unresolvedCommands ? `${unresolvedCommands} command(s) require manual reconciliation` : 'No unresolved cross-service commands', latencyMs: null, checkedAt },
      ];
      return { overallStatus: dependencies.some((item) => item.status === 'DOWN') ? 'OUTAGE' : dependencies.some((item) => item.status === 'DEGRADED') ? 'DEGRADED' : 'OPERATIONAL', version: process.env['GIT_SHA'] ?? process.env['APP_VERSION'] ?? 'development', dependencies, checkedAt };
    },
  },
  Mutation: {
    requestAuditExport: async (_: unknown, { from, to }: { from: Date | string; to: Date | string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['AUDITOR']);
      const range = validateExportRange(from, to);
      const doc = await AuditExportModel.create({ requesterFirebaseUid: admin.firebaseUid, requesterEmail: admin.email ?? 'unknown', ...range, status: 'PENDING', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
      void processAuditExport(doc._id.toString(), admin.firebaseUid, admin.email ?? 'unknown', range.from, range.to, auditMetadata(ctx)).catch(() => undefined);
      return mapDoc(doc);
    },
    createAdminTemplate: async (_: unknown, args: { key: string; type: string; title: string; publicMessage: string; internalGuidance?: string | null; locale?: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['TRUST_SAFETY', 'VERIFICATION_REVIEWER', 'SUPPORT_AGENT', 'CONTENT_MANAGER']);
      const key = normaliseKey(args.key); const locale = args.locale?.trim().toLowerCase() || 'en';
      validateTemplate(args.title, args.publicMessage, args.internalGuidance);
      const latest = await AdminTemplateModel.findOne({ key, locale }).sort({ version: -1 });
      const doc = await AdminTemplateModel.create({ ...args, key, locale, version: (latest?.version ?? 0) + 1, active: true, createdByFirebaseUid: admin.firebaseUid });
      await AdminTemplateModel.updateMany({ key, locale, active: true, _id: { $ne: doc._id } }, { $set: { active: false } });
      await audit(ctx, admin.firebaseUid, 'TEMPLATE_CREATE', doc._id.toString(), 'TEMPLATE', `Created ${key} version ${doc.version}`);
      return mapDoc(doc);
    },
    activateAdminTemplate: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['TRUST_SAFETY', 'VERIFICATION_REVIEWER', 'SUPPORT_AGENT', 'CONTENT_MANAGER']);
      const doc = await AdminTemplateModel.findById(id); if (!doc) throw notFound('Template');
      doc.active = true; await doc.save(); await AdminTemplateModel.updateMany({ key: doc.key, locale: doc.locale, active: true, _id: { $ne: doc._id } }, { $set: { active: false } });
      await audit(ctx, admin.firebaseUid, 'TEMPLATE_ACTIVATE', doc._id.toString(), 'TEMPLATE', `Activated ${doc.key} version ${doc.version}`);
      return mapDoc(doc);
    },
    createFeaturedPlacement: async (_: unknown, { input }: { input: PlacementInput }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const value = await validatePlacement(input);
      const doc = await FeaturedPlacementModel.create({ ...value, status: placementStatus(value.startsAt, value.endsAt), createdByFirebaseUid: admin.firebaseUid, updatedByFirebaseUid: admin.firebaseUid });
      await audit(ctx, admin.firebaseUid, 'PLACEMENT_CREATE', doc._id.toString(), 'FEATURED_PLACEMENT', `Created ${doc.title} at rank ${doc.rank}`); return mapDoc(doc);
    },
    updateFeaturedPlacement: async (_: unknown, { id, input }: { id: string; input: PlacementInput }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const current = await FeaturedPlacementModel.findById(id); if (!current) throw notFound('Placement'); const value = await validatePlacement(input, id); const before = current.status;
      current.set({ ...value, status: current.status === 'PAUSED' ? 'PAUSED' : placementStatus(value.startsAt, value.endsAt), updatedByFirebaseUid: admin.firebaseUid }); await current.save();
      await audit(ctx, admin.firebaseUid, 'PLACEMENT_UPDATE', current._id.toString(), 'FEATURED_PLACEMENT', `Updated ${current.title}`, before, current.status); return mapDoc(current);
    },
    pauseFeaturedPlacement: async (_: unknown, { id, paused }: { id: string; paused: boolean }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const doc = await FeaturedPlacementModel.findById(id); if (!doc) throw notFound('Placement'); const before = doc.status; doc.status = paused ? 'PAUSED' : placementStatus(doc.startsAt, doc.endsAt); doc.updatedByFirebaseUid = admin.firebaseUid; await doc.save();
      await audit(ctx, admin.firebaseUid, 'PLACEMENT_PAUSE', doc._id.toString(), 'FEATURED_PLACEMENT', paused ? 'Placement paused' : 'Placement resumed', before, doc.status); return mapDoc(doc);
    },
    duplicateFeaturedPlacement: async (_: unknown, { id, startsAt, endsAt, rank }: { id: string; startsAt: Date | string; endsAt: Date | string; rank: number }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const source = await FeaturedPlacementModel.findById(id); if (!source) throw notFound('Placement');
      const value = await validatePlacement({ targetType: source.targetType, targetId: source.targetId, regions: source.regions, rank, label: source.label, title: source.title, imageUrl: source.imageUrl, imageAlt: source.imageAlt, destinationUrl: source.destinationUrl, startsAt, endsAt, placementSource: source.placementSource }, undefined); const doc = await FeaturedPlacementModel.create({ ...value, status: placementStatus(value.startsAt, value.endsAt), createdByFirebaseUid: admin.firebaseUid, updatedByFirebaseUid: admin.firebaseUid });
      await audit(ctx, admin.firebaseUid, 'PLACEMENT_DUPLICATE', doc._id.toString(), 'FEATURED_PLACEMENT', `Duplicated from ${source._id}`); return mapDoc(doc);
    },
    reorderFeaturedPlacement: async (_: unknown, { id, rank }: { id: string; rank: number }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['CONTENT_MANAGER']); const doc = await FeaturedPlacementModel.findById(id); if (!doc) throw notFound('Placement'); await ensureNoRankConflict({ regions: doc.regions, rank, startsAt: doc.startsAt, endsAt: doc.endsAt }, id); const before = doc.rank; doc.rank = rank; doc.updatedByFirebaseUid = admin.firebaseUid; await doc.save();
      await audit(ctx, admin.firebaseUid, 'PLACEMENT_REORDER', doc._id.toString(), 'FEATURED_PLACEMENT', `Rank changed from ${before} to ${rank}`); return mapDoc(doc);
    },
    saveAdminView: async (_: unknown, args: { name: string; module: string; filtersJson: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth); validateFilters(args.filtersJson); const name = args.name.trim(); if (!name || name.length > 80) throw badInput('View name is required and must be at most 80 characters');
      const doc = await SavedAdminViewModel.findOneAndUpdate({ ownerFirebaseUid: admin.firebaseUid, module: args.module, name }, { $set: { filtersJson: args.filtersJson } }, { upsert: true, new: true, setDefaultsOnInsert: true });
      await audit(ctx, admin.firebaseUid, 'SAVED_VIEW_CREATE', doc._id.toString(), 'SAVED_VIEW', `Saved ${args.module} view ${name}`); return mapDoc(doc);
    },
    deleteSavedAdminView: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth); const doc = await SavedAdminViewModel.findOneAndDelete({ _id: id, ownerFirebaseUid: admin.firebaseUid }); if (!doc) throw notFound('Saved view'); await audit(ctx, admin.firebaseUid, 'SAVED_VIEW_DELETE', id, 'SAVED_VIEW', `Deleted saved view ${doc.name}`); return true;
    },
    markAdminNotificationRead: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth); const doc = await AdminNotificationModel.findOneAndUpdate({ _id: id, recipientFirebaseUid: admin.firebaseUid }, { $set: { readAt: new Date() } }, { new: true }); if (!doc) throw notFound('Notification'); return mapDoc(doc);
    },
    markAllAdminNotificationsRead: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth); await AdminNotificationModel.updateMany({ recipientFirebaseUid: admin.firebaseUid, readAt: null }, { $set: { readAt: new Date() } }); return true;
    },
  },
  AdminTemplate: { history: async (parent: { key: string; locale: string }, _: unknown, ctx: GraphQLContext) => { requirePlatformAdmin(ctx.auth, ['TRUST_SAFETY', 'VERIFICATION_REVIEWER', 'SUPPORT_AGENT', 'CONTENT_MANAGER', 'AUDITOR']); return (await AdminTemplateModel.find({ key: parent.key, locale: parent.locale }).sort({ version: -1 })).map(mapDoc); } },
};

function mapDoc<T extends { _id: { toString(): string }; toObject(): object }>(doc: T) { return { ...doc.toObject(), id: doc._id.toString() }; }
function addDateFilter(filter: Record<string, unknown>, from?: Date | string, to?: Date | string) { if (!from && !to) return; const range: Record<string, Date> = {}; if (from) range['$gte'] = new Date(from); if (to) range['$lte'] = new Date(to); filter['createdAt'] = range; }
export function validateExportRange(fromValue: Date | string, toValue: Date | string) { const from = new Date(fromValue); const to = new Date(toValue); if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from >= to) throw badInput('A valid audit export date range is required'); if (to.getTime() - from.getTime() > 31 * 24 * 60 * 60 * 1000) throw badInput('Audit exports are limited to 31 days'); if (to > new Date()) throw badInput('Audit export end date cannot be in the future'); return { from, to }; }
function csvCell(value: unknown) { const text = value == null ? '' : String(value); const safe = /^[=+\-@]/.test(text) ? `'${text}` : text; return `"${safe.replaceAll('"', '""')}"`; }
export function buildAuditCsv(events: Array<Record<string, unknown>>, uid: string, email: string, from: Date, to: Date) { const watermark = [`# Christian Listings security audit export`, `# Requested by ${email} (${uid})`, `# Range ${from.toISOString()} to ${to.toISOString()}`, `# Generated ${new Date().toISOString()}`]; const headers = ['id', 'createdAt', 'adminFirebaseUid', 'adminRoles', 'action', 'targetType', 'targetId', 'reason', 'beforeStatus', 'afterStatus', 'result', 'requestId', 'route']; const rows = events.map((event) => headers.map((key) => csvCell(key === 'id' ? event['_id'] : key === 'adminRoles' ? (event[key] as string[] | undefined)?.join('|') : event[key])).join(',')); return [...watermark, headers.join(','), ...rows].join('\r\n'); }
function normaliseKey(value: string) { const key = value.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_').replace(/^_+|_+$/g, ''); if (key.length < 2 || key.length > 60) throw badInput('Template key must contain 2–60 letters, numbers, or underscores'); return key; }
function validateTemplate(title: string, message: string, guidance?: string | null) { if (!title.trim() || title.length > 120) throw badInput('Template title is required and must be at most 120 characters'); if (message.trim().length < 5 || message.length > 2000) throw badInput('Public message must contain 5–2000 characters'); if ((guidance?.length ?? 0) > 2000) throw badInput('Internal guidance must be at most 2000 characters'); }
async function validatePlacement(input: PlacementInput, excludeId?: string) { const startsAt = new Date(input.startsAt); const endsAt = new Date(input.endsAt); if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || startsAt >= endsAt) throw badInput('Placement start must be before its end'); if (endsAt.getTime() - startsAt.getTime() > 180 * 24 * 60 * 60 * 1000) throw badInput('Placement duration is limited to 180 days'); const regions = [...new Set(input.regions.map((item) => item.trim().toUpperCase()).filter(Boolean))]; if (!regions.length || regions.length > 25) throw badInput('Select between 1 and 25 regions, using GLOBAL for all regions'); if (input.rank < 1 || input.rank > 100) throw badInput('Rank must be between 1 and 100'); if (!input.title.trim() || !input.label.trim()) throw badInput('Placement title and label are required'); validateUrl(input.destinationUrl, true); if (input.imageUrl) validateUrl(input.imageUrl, false); if (input.imageUrl && !input.imageAlt?.trim()) throw badInput('Image alt text is required when an image is supplied'); if (input.targetType !== 'ANNOUNCEMENT') { if (!input.targetId) throw badInput('A target ID is required'); await validatePlacementTarget(input.targetType, input.targetId); } await ensureNoRankConflict({ regions, rank: input.rank, startsAt, endsAt }, excludeId); return { ...input, targetId: input.targetType === 'ANNOUNCEMENT' ? null : input.targetId, regions, startsAt, endsAt, title: input.title.trim(), label: input.label.trim(), placementSource: input.placementSource ?? 'EDITORIAL' }; }
async function validatePlacementTarget(type: Exclude<PlacementInput['targetType'], 'ANNOUNCEMENT'>, id: string) { const request = { type, id, limit: 1 }; const result = type === 'ORGANISATION' ? await internalPost<{ items: unknown[] }>('IDENTITY_INTERNAL_URL', 'http://localhost:4001', '/internal/admin/directory', request) : type === 'EVENT' ? await internalPost<{ items: unknown[] }>('EVENTS_INTERNAL_URL', 'http://localhost:4002', '/internal/admin/directory', request) : await internalPost<{ items: unknown[] }>('CLASSIFIEDS_INTERNAL_URL', 'http://localhost:4003', '/internal/admin/directory', request); if (!result.items.length) throw badInput('The selected placement target does not exist'); }
async function ensureNoRankConflict(value: { regions: string[]; rank: number; startsAt: Date; endsAt: Date }, excludeId?: string) { const regionFilter = value.regions.includes('GLOBAL') ? { $exists: true } : { $in: [...value.regions, 'GLOBAL'] }; const filter: Record<string, unknown> = { rank: value.rank, status: { $nin: ['PAUSED', 'EXPIRED'] }, regions: regionFilter, startsAt: { $lt: value.endsAt }, endsAt: { $gt: value.startsAt } }; if (excludeId) filter['_id'] = { $ne: excludeId }; if (await FeaturedPlacementModel.exists(filter)) throw new GraphQLError('This rank overlaps another placement in one or more selected regions', { extensions: { code: 'CONFLICT' } }); }
export function placementStatus(startsAt: Date, endsAt: Date) { const now = new Date(); return endsAt <= now ? 'EXPIRED' : startsAt <= now ? 'ACTIVE' : 'SCHEDULED'; }
async function refreshPlacementStatuses() { const now = new Date(); await Promise.all([FeaturedPlacementModel.updateMany({ status: { $in: ['SCHEDULED', 'ACTIVE'] }, endsAt: { $lte: now } }, { $set: { status: 'EXPIRED' } }), FeaturedPlacementModel.updateMany({ status: 'SCHEDULED', startsAt: { $lte: now }, endsAt: { $gt: now } }, { $set: { status: 'ACTIVE' } })]); }
function validateUrl(value: string, allowRelative: boolean) { if (allowRelative && value.startsWith('/') && !value.startsWith('//')) return; try { const url = new URL(value); if (url.protocol !== 'https:' && !(process.env['NODE_ENV'] !== 'production' && url.hostname === 'localhost')) throw new Error(); } catch { throw badInput('Use a secure HTTPS URL or an internal path'); } }
function validateFilters(value: string) { if (value.length > 4000) throw badInput('Saved filters are too large'); try { const parsed = JSON.parse(value); if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error(); } catch { throw badInput('Saved filters must be a JSON object'); } }
async function refreshSlaNotifications(firebaseUid: string) { const now = new Date(); const soon = new Date(Date.now() + 24 * 60 * 60 * 1000); const submissions = await VerificationSubmissionModel.find({ assigneeFirebaseUid: firebaseUid, status: 'PENDING_REVIEW', dueAt: { $lte: soon } }).limit(50); await Promise.all(submissions.map((doc) => notifyAdmin(firebaseUid, doc.dueAt < now ? 'ESCALATION' : 'SLA_WARNING', doc.dueAt < now ? 'Verification SLA breached' : 'Verification SLA approaching', `${doc.organisationName} is ${doc.dueAt < now ? 'overdue' : 'due within 24 hours'}.`, `/verifications/${doc._id}`, `verification-sla:${doc._id}:${doc.dueAt < now ? 'overdue' : 'approaching'}`))); }
async function checkHttp(name: string, baseUrl: string) { const started = Date.now(); try { const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(2000) }); return { name, category: 'SUBGRAPH', status: response.ok ? 'OPERATIONAL' : 'DEGRADED', detail: response.ok ? 'Health endpoint responded' : `HTTP ${response.status}`, latencyMs: Date.now() - started }; } catch (error) { return { name, category: 'SUBGRAPH', status: 'DOWN', detail: error instanceof Error ? error.message : 'Health check failed', latencyMs: Date.now() - started }; } }
function provider(name: string, category: string, configured: boolean, checkedAt: Date, missingDetail = 'Required provider is not configured') { return { name, category, status: configured ? 'OPERATIONAL' : 'DEGRADED', detail: configured ? 'Configuration present' : missingDetail, latencyMs: null, checkedAt }; }
function badInput(message: string) { return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } }); }
function notFound(label: string) { return new GraphQLError(`${label} not found`, { extensions: { code: 'NOT_FOUND' } }); }
type AuditMetadata = { adminRoles: string[]; route: string | null; ipAddress: string | null; userAgent: string | null; requestId: string | null };
function auditMetadata(ctx: GraphQLContext): AuditMetadata { const route = ctx.request.headers['x-admin-route']; const userAgent = ctx.request.headers['user-agent']; const requestId = ctx.request.headers['x-request-id']; return { adminRoles: ctx.admin.roles, route: Array.isArray(route) ? route[0] ?? null : route ?? null, ipAddress: ctx.request.ip ?? null, userAgent: Array.isArray(userAgent) ? userAgent[0] ?? null : userAgent ?? null, requestId: Array.isArray(requestId) ? requestId[0] ?? null : requestId ?? null }; }
async function processAuditExport(id: string, firebaseUid: string, email: string, from: Date, to: Date, metadata: AuditMetadata) { const doc = await AuditExportModel.findById(id).select('+csvContent'); if (!doc) return; try { const events = await AuditEventModel.find({ createdAt: { $gte: from, $lte: to } }).sort({ createdAt: -1 }).limit(10_000); doc.csvContent = buildAuditCsv(events.map((event) => event.toObject() as unknown as Record<string, unknown>), firebaseUid, email, from, to); doc.rowCount = events.length; doc.status = 'READY'; await doc.save(); await AuditEventModel.create({ adminFirebaseUid: firebaseUid, action: 'REQUEST_AUDIT_EXPORT', targetId: id, targetType: 'AUDIT_EXPORT', caseId: null, reason: `Created bounded audit export with ${events.length} rows`, beforeStatus: 'PENDING', afterStatus: 'READY', result: 'SUCCESS', ...metadata }); } catch (error) { doc.status = 'FAILED'; doc.failureReason = error instanceof Error ? error.message.slice(0, 500) : 'Export failed'; await doc.save(); await AuditEventModel.create({ adminFirebaseUid: firebaseUid, action: 'REQUEST_AUDIT_EXPORT', targetId: id, targetType: 'AUDIT_EXPORT', caseId: null, reason: doc.failureReason, beforeStatus: 'PENDING', afterStatus: 'FAILED', result: 'FAILED', ...metadata }); await notifyAdmin(firebaseUid, 'ACTION_FAILED', 'Audit export failed', 'Your requested audit export could not be generated.', '/audit', `audit-export-failed:${id}`); } }

export async function reconcileAuditExports() {
  const pending = await AuditExportModel.find({ status: 'PENDING', expiresAt: { $gt: new Date() } }).sort({ createdAt: 1 }).limit(25);
  await Promise.allSettled(pending.map((doc) => processAuditExport(
    doc._id.toString(),
    doc.requesterFirebaseUid,
    doc.requesterEmail,
    doc.from,
    doc.to,
    { adminRoles: [], route: 'background:audit-export-reconciliation', ipAddress: null, userAgent: null, requestId: `reconcile-${doc._id}` },
  )));
  await AuditExportModel.updateMany({ status: 'PENDING', expiresAt: { $lte: new Date() } }, { $set: { status: 'EXPIRED', failureReason: 'Export expired before processing completed' } });
}
