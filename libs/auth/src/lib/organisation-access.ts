import type { AuthContext } from './context-builder';

export const ORGANISATION_ROLES = ['master_admin', 'site_admin', 'events_manager', 'jobs_manager', 'classifieds_manager'] as const;
export type OrganisationRole = (typeof ORGANISATION_ROLES)[number];

export interface OrganisationAccess {
  orgId: string;
  roles: OrganisationRole[];
}

export function getOrganisationAccess(auth: AuthContext): OrganisationAccess | null {
  if (!auth.isAuthenticated || !auth.decodedToken) return null;
  const orgId = typeof auth.decodedToken['orgId'] === 'string' ? auth.decodedToken['orgId'] : null;
  const roles = Array.isArray(auth.decodedToken['roles']) ? auth.decodedToken['roles'].filter((role): role is OrganisationRole => typeof role === 'string' && ORGANISATION_ROLES.includes(role as OrganisationRole)) : [];
  return orgId ? { orgId, roles } : null;
}

export function canAccessOrganisation(auth: AuthContext, organisationId: string, allowedRoles?: OrganisationRole[]) {
  const access = getOrganisationAccess(auth);
  if (!access || access.orgId !== organisationId) return false;
  return !allowedRoles?.length || access.roles.some((role) => allowedRoles.includes(role));
}
