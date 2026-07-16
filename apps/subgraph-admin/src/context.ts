import type { FastifyRequest } from 'fastify';
import {
  buildAuthContext,
  requirePlatformAdmin,
  type AuthContext,
  type PlatformAdminAccess,
} from '@christian-listings/auth';

export interface GraphQLContext {
  auth: AuthContext;
  admin: PlatformAdminAccess;
  request: FastifyRequest;
}

export function buildContext(request: FastifyRequest): GraphQLContext {
  const auth = buildAuthContext(request);
  return {
    auth,
    admin: requirePlatformAdmin(auth),
    request,
  };
}
