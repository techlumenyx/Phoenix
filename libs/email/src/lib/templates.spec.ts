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
});
