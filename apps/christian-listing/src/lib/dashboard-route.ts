interface DashboardRouteAccess {
  accountType?: string | null;
  orgId?: string | null;
  roles?: string[] | null;
}

export function getDashboardRoute({
  accountType,
  orgId,
  roles,
}: DashboardRouteAccess): '/org' | '/dashboard' {
  const isOrganisationAccount = accountType === 'organisation';
  const isOrganisationMember = Boolean(orgId && roles?.length);

  return isOrganisationAccount || isOrganisationMember ? '/org' : '/dashboard';
}
