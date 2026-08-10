import {
  canManageOrganisationLifecycle,
  canManageOrganisationSettings,
} from './organisation-permissions';

describe('organisation settings permissions', () => {
  it.each(['master_admin', 'site_admin'])('allows %s to manage settings', (role) => {
    expect(canManageOrganisationSettings([role])).toBe(true);
  });

  it.each(['events_manager', 'jobs_manager', 'classifieds_manager'])(
    'does not allow %s to manage settings',
    (role) => expect(canManageOrganisationSettings([role])).toBe(false),
  );

  it('allows only the master admin to change organisation lifecycle', () => {
    expect(canManageOrganisationLifecycle(['master_admin'])).toBe(true);
    expect(canManageOrganisationLifecycle(['site_admin'])).toBe(false);
  });

  it('denies missing and unrelated roles', () => {
    expect(canManageOrganisationSettings(undefined)).toBe(false);
    expect(canManageOrganisationSettings([])).toBe(false);
    expect(canManageOrganisationSettings(['user'])).toBe(false);
  });
});
