import { requirePlatformAdmin } from './admin-access';
import type { AuthContext } from './context-builder';

function auth(claims: Record<string, unknown> | null): AuthContext {
  return {
    firebaseUid: claims ? 'admin-uid' : null,
    email: claims ? 'admin@example.test' : null,
    isAuthenticated: Boolean(claims),
    decodedToken: claims as AuthContext['decodedToken'],
  };
}

describe('requirePlatformAdmin', () => {
  it('rejects a non-admin account', () => {
    expect(() => requirePlatformAdmin(auth({ accountType: 'user' }))).toThrow('Admin access required');
  });

  it('requires one of the allowed roles', () => {
    expect(() => requirePlatformAdmin(
      auth({ accountType: 'admin', roles: ['ANALYST'] }),
      ['TRUST_SAFETY'],
    )).toThrow('Insufficient admin permissions');
  });

  it('allows a super admin through a role-specific guard', () => {
    expect(requirePlatformAdmin(
      auth({ accountType: 'admin', roles: ['SUPER_ADMIN'] }),
      ['VERIFICATION_REVIEWER'],
    ).roles).toEqual(['SUPER_ADMIN']);
  });

  it.each([
    'TRUST_SAFETY', 'VERIFICATION_REVIEWER', 'CONTENT_MANAGER', 'SUPPORT_AGENT', 'ANALYST', 'AUDITOR',
  ] as const)('allows %s only through a matching role guard', (role) => {
    expect(requirePlatformAdmin(auth({ accountType: 'admin', roles: [role] }), [role]).roles).toEqual([role]);
    expect(() => requirePlatformAdmin(auth({ accountType: 'admin', roles: [role] }), ['SUPER_ADMIN'])).toThrow('Insufficient admin permissions');
  });

  it('drops unknown or community roles from trusted access', () => {
    expect(requirePlatformAdmin(auth({ accountType: 'admin', roles: ['owner', 'ROOT', 'AUDITOR'] })).roles).toEqual(['AUDITOR']);
  });
});
