import type { FastifyRequest } from 'fastify';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthContext {
  firebaseUid: string | null;
  email: string | null;
  isAuthenticated: boolean;
  decodedToken: DecodedIdToken | null;
}

declare module 'fastify' {
  interface FastifyRequest {
    firebaseUser?: DecodedIdToken;
  }
}

export function buildAuthContext(request: FastifyRequest): AuthContext {
  const decoded = request.firebaseUser ?? null;
  return {
    firebaseUid: decoded?.uid ?? null,
    email: decoded?.email ?? null,
    isAuthenticated: decoded !== null,
    decodedToken: decoded,
  };
}
