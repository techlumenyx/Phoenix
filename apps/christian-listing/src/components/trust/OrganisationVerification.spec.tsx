import { fireEvent, render, screen } from '@testing-library/react';
import { OrganisationVerificationNotice, OrganisationVerificationStatus } from './OrganisationVerification';

describe('Organisation verification trust messaging', () => {
  it('shows a verified status without an unverified tooltip', () => {
    render(<OrganisationVerificationStatus organisationName="Grace Town Ministries" isVerified context="event" />);
    expect(screen.getByText('✓ Verified Poster')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Unverified/i })).toBeNull();
  });

  it('shows event-specific guidance in the unverified tooltip', () => {
    render(<OrganisationVerificationStatus organisationName="Grace Town Ministries" isVerified={false} context="event" />);
    const trigger = screen.getByRole('button', { name: /Unverified/i });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('tooltip').textContent).toContain('Confirm the event details before registering or making a payment.');
  });

  it('uses job-specific guidance in the full warning', () => {
    render(<OrganisationVerificationNotice organisationName="Grace Town Ministries" isVerified={false} context="job" />);
    expect(screen.getByLabelText('Organisation verification warning').textContent).toContain('before applying or sharing personal information');
  });

  it('does not render a warning for a verified organisation', () => {
    const { container } = render(<OrganisationVerificationNotice organisationName="Grace Town Ministries" isVerified context="listing" />);
    expect(container.innerHTML).toBe('');
  });
});
