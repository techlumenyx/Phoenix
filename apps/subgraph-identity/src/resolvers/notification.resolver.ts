import { GraphQLError } from 'graphql';
import { canAccessOrganisation } from '@christian-listings/auth';
import { IdentityOrganisationNotificationModel } from '../models';
import type { GraphQLContext } from '../context';

const shape = (doc: InstanceType<typeof IdentityOrganisationNotificationModel>) => ({
  id: doc._id.toString(),
  type: doc.type,
  title: doc.title,
  message: doc.message,
  href: doc.href,
  sourceId: doc.sourceId,
  readAt: doc.readAt,
  createdAt: doc.createdAt,
});
function requireAccess(ctx: GraphQLContext, organisationId: string) {
  if (!canAccessOrganisation(ctx.auth, organisationId))
    throw new GraphQLError('Organisation notification access denied', {
      extensions: { code: 'FORBIDDEN' },
    });
}

export const identityNotificationResolvers = {
  Query: {
    identityOrganisationNotifications: async (
      _: unknown,
      {
        organisationId,
        unreadOnly = false,
        limit = 50,
      }: { organisationId: string; unreadOnly?: boolean; limit?: number },
      ctx: GraphQLContext,
    ) => {
      requireAccess(ctx, organisationId);
      const docs = await IdentityOrganisationNotificationModel.find({
        organisationId,
        ...(unreadOnly && { readAt: null }),
      })
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100));
      return docs.map(shape);
    },
    identityOrganisationUnreadCount: async (
      _: unknown,
      { organisationId }: { organisationId: string },
      ctx: GraphQLContext,
    ) => {
      requireAccess(ctx, organisationId);
      return IdentityOrganisationNotificationModel.countDocuments({ organisationId, readAt: null });
    },
  },
  Mutation: {
    markIdentityOrganisationNotificationRead: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      const current = await IdentityOrganisationNotificationModel.findById(id);
      if (!current)
        throw new GraphQLError('Notification not found', { extensions: { code: 'NOT_FOUND' } });
      requireAccess(ctx, current.organisationId.toString());
      current.readAt ??= new Date();
      await current.save();
      return shape(current);
    },
    markAllIdentityOrganisationNotificationsRead: async (
      _: unknown,
      { organisationId }: { organisationId: string },
      ctx: GraphQLContext,
    ) => {
      requireAccess(ctx, organisationId);
      await IdentityOrganisationNotificationModel.updateMany(
        { organisationId, readAt: null },
        { $set: { readAt: new Date() } },
      );
      return true;
    },
  },
};
