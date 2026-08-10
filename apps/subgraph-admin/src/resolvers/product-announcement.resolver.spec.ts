import type { GraphQLContext } from '../context';
import { resolveAnnouncementAudience, validateAnnouncementInput } from './product-announcement.resolver';

function context(claims: Record<string, unknown>) {
  return { auth: { decodedToken: claims } } as Pick<GraphQLContext, 'auth'>;
}

describe('product announcements', () => {
  it.each([
    [{ accountType: 'user' }, 'MEMBER'],
    [{ accountType: 'organisation' }, 'ORGANISATION'],
    [{ accountType: 'user', orgId: 'org-1' }, 'ORGANISATION'],
    [{ accountType: 'admin' }, 'ADMIN'],
  ])('targets claims %p to %s', (claims, expected) => {
    expect(resolveAnnouncementAudience(context(claims))).toBe(expected);
  });

  it('normalises a valid release and removes duplicate audiences', () => {
    const result = validateAnnouncementInput({ releaseKey: ' August 2026 ', title: ' New search ', body: 'Useful release details', audiences: ['MEMBER', 'MEMBER'] });
    expect(result.releaseKey).toBe('AUGUST-2026');
    expect(result.title).toBe('New search');
    expect(result.audiences).toEqual(['MEMBER']);
  });

  it('requires paired button fields and safe destinations', () => {
    const base = { releaseKey: '2026.08', title: 'Update', body: 'Useful release details', audiences: ['MEMBER'] as const };
    expect(() => validateAnnouncementInput({ ...base, audiences: [...base.audiences], buttonLabel: 'Learn more' })).toThrow('provided together');
    expect(() => validateAnnouncementInput({ ...base, audiences: [...base.audiences], buttonLabel: 'Learn more', buttonUrl: 'javascript:alert(1)' })).toThrow('secure HTTPS');
  });
});
