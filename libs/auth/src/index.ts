export { getFirebaseAdmin } from './lib/firebase-admin';
export { verifyFirebaseToken, UnauthorizedError } from './lib/verify-token';
export { buildAuthPlugin } from './lib/fastify-auth.plugin';
export { buildAuthContext } from './lib/context-builder';
export type { AuthContext } from './lib/context-builder';
