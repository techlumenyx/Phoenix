import { getDashboardRoute } from './dashboard-route';

describe('getDashboardRoute', () => {
  it('routes organisation accounts to the organisation dashboard', () => {
    expect(getDashboardRoute({ accountType: 'organisation' })).toBe('/org');
  });

  it('routes organisation-linked members to the organisation dashboard', () => {
    expect(
      getDashboardRoute({
        accountType: 'individual',
        orgId: 'organisation-id',
        roles: ['MEMBER'],
      }),
    ).toBe('/org');
  });

  it('routes individual users to their personal dashboard', () => {
    expect(
      getDashboardRoute({
        accountType: 'individual',
        orgId: null,
        roles: [],
      }),
    ).toBe('/dashboard');
  });

  it('does not treat an orphaned organisation id as active membership', () => {
    expect(
      getDashboardRoute({
        accountType: 'individual',
        orgId: 'organisation-id',
        roles: [],
      }),
    ).toBe('/dashboard');
  });
});
