export const ORGANISATION_SETTINGS_ROLES = ['master_admin', 'site_admin'] as const;

export function canManageOrganisationSettings(roles: readonly string[] | null | undefined): boolean {
  return Boolean(roles?.some((role) => ORGANISATION_SETTINGS_ROLES.includes(
    role as (typeof ORGANISATION_SETTINGS_ROLES)[number],
  )));
}

export function canManageOrganisationLifecycle(roles: readonly string[] | null | undefined): boolean {
  return Boolean(roles?.includes('master_admin'));
}
