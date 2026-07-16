import { GraphQLError } from 'graphql';
import { requirePlatformAdmin, type PlatformAdminRole } from '@christian-listings/auth';
import type { GraphQLContext } from '../context';
import { audit, internalPost } from './verification.resolver';

type DirectoryType = 'USER' | 'ORGANISATION' | 'EVENT' | 'JOB' | 'MARKETPLACE_ITEM';
interface ServiceDirectoryItem {
  id: string; type: DirectoryType; title: string; subtitle?: string | null; status: string; region?: string | null;
  ownerFirebaseUid?: string | null; organisationId?: string | null; seriesId?: string | null; createdAt: string; privateSummary?: string | null;
}
interface ServiceDirectoryResult { items: ServiceDirectoryItem[]; hasNextPage: boolean; endCursor: string | null }

export const directoryResolvers = {
  Query: {
    adminDirectory: async (_: unknown, args: { type: DirectoryType; search?: string; limit?: number; after?: string }, ctx: GraphQLContext) => {
      requireDirectoryAccess(ctx, args.type);
      const result = await fetchDirectory(args);
      return { edges: result.items.map(publicItem), hasNextPage: result.hasNextPage, endCursor: result.endCursor };
    },
  },
  Mutation: {
    applyAccountAction: async (_: unknown, args: { type: DirectoryType; id: string; action: 'WARN' | 'SUSPEND' | 'REACTIVATE'; reason: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['SUPPORT_AGENT', 'TRUST_SAFETY']);
      if (!['USER', 'ORGANISATION'].includes(args.type)) throw new GraphQLError('Account actions only support users and organisations', { extensions: { code: 'BAD_USER_INPUT' } });
      const reason = validateReason(args.reason);
      if (args.type === 'ORGANISATION' && args.action === 'SUSPEND') await applyOrganisationContentAction(args.id, args.action);
      const result = await internalPost<{ status: string; warningCount: number }>('IDENTITY_INTERNAL_URL', 'http://localhost:4001', '/internal/admin/account-action', { ...args, reason });
      if (args.type === 'ORGANISATION' && args.action === 'REACTIVATE') await applyOrganisationContentAction(args.id, args.action);
      const refreshed = await fetchDirectory({ type: args.type, id: args.id, limit: 1 });
      const item = refreshed.items[0];
      if (!item) throw new GraphQLError('Account not found after update', { extensions: { code: 'BAD_GATEWAY' } });
      await audit(ctx, admin.firebaseUid, `ACCOUNT_${args.action}`, args.id, args.type as 'USER' | 'ORGANISATION', reason, null, result.status);
      return publicItem(item);
    },
    applyEventAction: async (_: unknown, args: { id: string; action: 'CANCEL' | 'RESTORE'; scope: 'OCCURRENCE' | 'SERIES'; reason: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['TRUST_SAFETY', 'CONTENT_MANAGER']);
      const reason = validateReason(args.reason);
      const result = await internalPost<{ changed: number; status: string }>('EVENTS_INTERNAL_URL', 'http://localhost:4002', '/internal/admin/event-action', { ...args, reason });
      await audit(ctx, admin.firebaseUid, `EVENT_${args.action}`, args.id, 'EVENT', `${reason} (${args.scope.toLowerCase()}, ${result.changed} record(s))`, null, result.status);
      return true;
    },
    accessDirectoryPrivateData: async (_: unknown, args: { type: DirectoryType; id: string; reason: string }, ctx: GraphQLContext) => {
      const admin = requirePlatformAdmin(ctx.auth, ['SUPPORT_AGENT', 'TRUST_SAFETY']);
      if (!['USER', 'ORGANISATION'].includes(args.type)) throw new GraphQLError('Private-data access is only available for identity records', { extensions: { code: 'BAD_USER_INPUT' } });
      const reason = validateReason(args.reason);
      const result = await fetchDirectory({ type: args.type, id: args.id, limit: 1 });
      const privateSummary = result.items[0]?.privateSummary;
      if (!privateSummary) throw new GraphQLError('Private data not found', { extensions: { code: 'NOT_FOUND' } });
      await audit(ctx, admin.firebaseUid, 'ACCESS_PRIVATE_DATA', args.id, args.type as 'USER' | 'ORGANISATION', `Private data accessed: ${reason}`);
      return privateSummary;
    },
  },
};

function requireDirectoryAccess(ctx: GraphQLContext, type: DirectoryType) {
  const roles: PlatformAdminRole[] = type === 'USER' ? ['SUPPORT_AGENT', 'TRUST_SAFETY', 'AUDITOR'] : type === 'ORGANISATION' ? ['SUPPORT_AGENT', 'TRUST_SAFETY', 'VERIFICATION_REVIEWER', 'AUDITOR'] : ['CONTENT_MANAGER', 'TRUST_SAFETY', 'AUDITOR'];
  return requirePlatformAdmin(ctx.auth, roles);
}
async function fetchDirectory(args: { type: DirectoryType; search?: string; limit?: number; after?: string; id?: string }) {
  if (args.type === 'USER' || args.type === 'ORGANISATION') return internalPost<ServiceDirectoryResult>('IDENTITY_INTERNAL_URL', 'http://localhost:4001', '/internal/admin/directory', args);
  if (args.type === 'EVENT') return internalPost<ServiceDirectoryResult>('EVENTS_INTERNAL_URL', 'http://localhost:4002', '/internal/admin/directory', args);
  return internalPost<ServiceDirectoryResult>('CLASSIFIEDS_INTERNAL_URL', 'http://localhost:4003', '/internal/admin/directory', args);
}
function publicItem(item: ServiceDirectoryItem) { return { ...item, id: `${item.type}:${item.id}`, sourceId: item.id, privateSummary: null }; }
function validateReason(value: string) { const reason = value.trim(); if (reason.length < 5 || reason.length > 1000) throw new GraphQLError('A reason between 5 and 1000 characters is required', { extensions: { code: 'BAD_USER_INPUT' } }); return reason; }
async function applyOrganisationContentAction(organisationId: string, action: 'SUSPEND' | 'REACTIVATE') {
  await Promise.all([
    internalPost('EVENTS_INTERNAL_URL', 'http://localhost:4002', '/internal/admin/organisation-action', { organisationId, action }),
    internalPost('CLASSIFIEDS_INTERNAL_URL', 'http://localhost:4003', '/internal/admin/organisation-action', { organisationId, action }),
  ]);
}
