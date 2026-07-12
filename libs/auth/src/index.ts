export { getFirebaseAdmin } from './lib/firebase-admin';
export { verifyFirebaseToken, UnauthorizedError } from './lib/verify-token';
export { buildAuthPlugin } from './lib/fastify-auth.plugin';
export { buildAuthContext } from './lib/context-builder';
export type { AuthContext } from './lib/context-builder';
export { getOrganisationAccess, canAccessOrganisation, ORGANISATION_ROLES } from './lib/organisation-access';
export type { OrganisationAccess, OrganisationRole } from './lib/organisation-access';
