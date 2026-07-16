import { GraphQLError } from 'graphql';
import type { GraphQLContext } from '../context';
import { AdminModel } from '../models';
import type { AdminDocument } from '../models/admin.model';

function mapAdmin(doc: AdminDocument) {
  return {
    id: doc._id.toString(),
    firebaseUid: doc.firebaseUid,
    email: doc.email,
    name: doc.name,
    roles: doc.roles,
    status: doc.status,
    lastLoginAt: doc.lastLoginAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const adminResolvers = {
  Query: {
    adminMe: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.auth.isAuthenticated || !ctx.auth.firebaseUid) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (ctx.auth.decodedToken?.['accountType'] !== 'admin') {
        throw new GraphQLError('Admin access required', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const doc = await AdminModel.findOne({
        firebaseUid: ctx.auth.firebaseUid,
        status: 'ACTIVE',
      });

      if (!doc) {
        throw new GraphQLError('Admin account is not active', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const tokenRoles = Array.isArray(ctx.auth.decodedToken?.['roles'])
        ? ctx.auth.decodedToken?.['roles']
        : [];
      const rolesMatch = doc.roles.length === tokenRoles.length &&
        doc.roles.every((role) => tokenRoles.includes(role));
      if (!rolesMatch) {
        throw new GraphQLError('Admin session permissions are stale', {
          extensions: { code: 'FORBIDDEN', refreshToken: true },
        });
      }

      return mapAdmin(doc);
    },
  },
};
