interface OrganisationAccessState {
  signedIn: boolean;
  accountType?: string | null;
  orgId?: string | null;
  roles?: string[] | null;
}

export function organisationAuthRedirect({
  signedIn,
  accountType,
  orgId,
  roles,
}: OrganisationAccessState): '/org' | '/org/onboarding/identity' | null {
  if (!signedIn) return null;
  if (accountType === 'organisation' || Boolean(orgId && roles?.length)) return '/org';
  return '/org/onboarding/identity';
}

export function isOrganisationPath(pathname: string) {
  return pathname === '/org' || pathname.startsWith('/org/');
}
