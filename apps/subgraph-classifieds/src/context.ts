import type { FastifyRequest } from 'fastify';
import { buildAuthContext, type AuthContext } from '@christian-listings/auth';

export interface GraphQLContext {
  auth: AuthContext;
  request: FastifyRequest;
}

export function buildContext(request: FastifyRequest): GraphQLContext {
  return {
    auth: buildAuthContext(request),
    request,
  };
}
