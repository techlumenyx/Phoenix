import { renderEmail } from './templates';

describe('renderEmail', () => {
  it('escapes variables and includes the invite link', () => {
    const result = renderEmail('ORGANISATION_INVITATION', { organisationName: '<Grace>', roles: 'events manager', inviteUrl: 'https://example.test/invite' });
    expect(result.html).toContain('&lt;Grace&gt;');
    expect(result.html).toContain('https://example.test/invite');
  });

  it('rejects an incomplete template payload', () => {
    expect(() => renderEmail('EVENT_REMINDER', { eventTitle: 'Gathering' })).toThrow('Missing email variable');
  });

  it('renders the controlled SendGrid test without exposing HTML from admin identity data', () => {
    const result = renderEmail('SENDGRID_TEST', { requestedBy: '<admin@example.test>', sentAt: '2026-07-26T10:00:00.000Z' });
    expect(result.subject).toBe('Christian Listings SendGrid test');
    expect(result.html).toContain('&lt;admin@example.test&gt;');
    expect(result.text).toContain('2026-07-26T10:00:00.000Z');
  });
});
