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

  it('rejects an authenticated non-admin account', () => {
    const request = {
      firebaseUser: {
        uid: 'member-uid',
        email: 'member@example.test',
        accountType: 'user',
      },
    };

    expect(() => buildContext(request as never)).toThrow('Admin access required');
  });
});
