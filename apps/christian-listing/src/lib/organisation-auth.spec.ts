import { isOrganisationPath, organisationAuthRedirect } from './organisation-auth';

describe('organisation authentication routing', () => {
  it('keeps a newly authenticated account in organisation onboarding', () => {
    expect(organisationAuthRedirect({ signedIn: true, accountType: null, orgId: null, roles: [] }))
      .toBe('/org/onboarding/identity');
  });

  it('routes an organisation-linked account to its dashboard', () => {
    expect(organisationAuthRedirect({ signedIn: true, accountType: 'user', orgId: 'org-1', roles: ['master_admin'] }))
      .toBe('/org');
  });

  it('does not redirect a signed-out visitor', () => {
    expect(organisationAuthRedirect({ signedIn: false })).toBeNull();
  });

  it('recognises the organisation root and onboarding routes', () => {
    expect(isOrganisationPath('/org')).toBe(true);
    expect(isOrganisationPath('/org/onboarding/identity')).toBe(true);
    expect(isOrganisationPath('/onboarding/region')).toBe(false);
  });
});
