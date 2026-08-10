import type { FastifyRequest } from 'fastify';
import {
  buildAuthContext,
  requirePlatformAdmin,
  type AuthContext,
  type PlatformAdminAccess,
} from '@christian-listings/auth';

export interface GraphQLContext {
  auth: AuthContext;
  admin: PlatformAdminAccess | null;
  request: FastifyRequest;
}

export function buildContext(request: FastifyRequest): GraphQLContext {
  const auth = buildAuthContext(request);
  let admin: PlatformAdminAccess | null = null;
  try {
    admin = requirePlatformAdmin(auth);
  } catch {
    // The admin subgraph also owns participant-facing report conversations.
    // Individual resolvers enforce either platform-admin or participant access.
  }
  return {
    auth,
    admin,
    request,
  };
}
