import { buildContext } from './context';

describe('admin GraphQL context', () => {
  it('accepts a platform admin and exposes claimed roles', () => {
    const request = {
      firebaseUser: {
        uid: 'admin-uid',
        email: 'admin@example.test',
        accountType: 'admin',
        roles: ['TRUST_SAFETY'],
      },
    };

    const context = buildContext(request as never);

    expect(context.admin).toEqual({
      firebaseUid: 'admin-uid',
      email: 'admin@example.test',
      roles: ['TRUST_SAFETY'],
    });
  });

  it('allows an authenticated member into participant-facing resolvers without admin access', () => {
    const request = {
      firebaseUser: {
        uid: 'member-uid',
        email: 'member@example.test',
        accountType: 'user',
      },
    };

    const context = buildContext(request as never);
    expect(context.auth.firebaseUid).toBe('member-uid');
    expect(context.admin).toBeNull();
  });
});
