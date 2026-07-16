import { GraphQLError } from 'graphql';
import type { AuthContext } from './context-builder';

export const PLATFORM_ADMIN_ROLES = [
  'SUPER_ADMIN',
  'TRUST_SAFETY',
  'VERIFICATION_REVIEWER',
  'CONTENT_MANAGER',
  'SUPPORT_AGENT',
  'ANALYST',
  'AUDITOR',
] as const;

export type PlatformAdminRole = (typeof PLATFORM_ADMIN_ROLES)[number];

export interface PlatformAdminAccess {
  firebaseUid: string;
  email: string | null;
  roles: PlatformAdminRole[];
}

export function requirePlatformAdmin(
  auth: AuthContext,
  allowedRoles: PlatformAdminRole[] = [],
): PlatformAdminAccess {
  if (!auth.isAuthenticated || !auth.firebaseUid) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (auth.decodedToken?.['accountType'] !== 'admin') {
    throw new GraphQLError('Admin access required', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  const claimedRoles = Array.isArray(auth.decodedToken?.['roles'])
    ? auth.decodedToken['roles'].filter((role): role is PlatformAdminRole =>
        PLATFORM_ADMIN_ROLES.includes(role as PlatformAdminRole),
      )
    : [];

  if (
    allowedRoles.length > 0 &&
    !claimedRoles.includes('SUPER_ADMIN') &&
    !allowedRoles.some((role) => claimedRoles.includes(role))
  ) {
    throw new GraphQLError('Insufficient admin permissions', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  return {
    firebaseUid: auth.firebaseUid,
    email: auth.email,
    roles: claimedRoles,
  };
}
