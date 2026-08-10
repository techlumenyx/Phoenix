import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrgSettingsAccess from './OrgSettingsAccess';
import { useOrganisationPermissions } from '../../hooks/useOrganisationPermissions';

jest.mock('../../hooks/useOrganisationPermissions', () => ({
  useOrganisationPermissions: jest.fn(),
}));

const mockedPermissions = jest.mocked(useOrganisationPermissions);
const refetch = jest.fn();

function permissions(overrides: Partial<ReturnType<typeof useOrganisationPermissions>> = {}) {
  mockedPermissions.mockReturnValue({
    roles: [],
    canManageSettings: false,
    canManageLifecycle: false,
    loading: false,
    error: undefined,
    refetch: refetch as ReturnType<typeof useOrganisationPermissions>['refetch'],
    ...overrides,
  });
}

describe('OrgSettingsAccess', () => {
  beforeEach(() => {
    refetch.mockReset();
    permissions();
  });

  it('renders settings for an authorised role', () => {
    permissions({ roles: ['site_admin'], canManageSettings: true });
    render(<MemoryRouter><OrgSettingsAccess><p>Organisation settings form</p></OrgSettingsAccess></MemoryRouter>);
    expect(screen.getByText('Organisation settings form')).toBeTruthy();
  });

  it('shows an explicit access-denied state instead of a 404', () => {
    render(<MemoryRouter><OrgSettingsAccess><p>Hidden settings</p></OrgSettingsAccess></MemoryRouter>);
    expect(screen.getByRole('alert').textContent).toContain('Settings access denied');
    expect(screen.queryByText('Hidden settings')).toBeNull();
    expect(screen.getByRole('link', { name: 'Return to overview' }).getAttribute('href')).toBe('/org');
  });

  it('does not show a denial while permission data is loading', () => {
    permissions({ loading: true });
    render(<MemoryRouter><OrgSettingsAccess><p>Hidden settings</p></OrgSettingsAccess></MemoryRouter>);
    expect(screen.getByLabelText('Loading results')).toBeTruthy();
    expect(screen.queryByText('Settings access denied')).toBeNull();
  });
});
