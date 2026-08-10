import { gql, useQuery } from '@apollo/client';
import { useAuthStore } from '../store/authStore';
import {
  canManageOrganisationLifecycle,
  canManageOrganisationSettings,
} from '../lib/organisation-permissions';

const ORGANISATION_PERMISSIONS = gql`
  query OrganisationPermissions {
    me {
      id
      roles
    }
  }
`;

interface OrganisationPermissionsData {
  me: { id: string; roles: string[] } | null;
}

export function useOrganisationPermissions() {
  const signedIn = useAuthStore((state) => Boolean(state.user));
  const storedUser = useAuthStore((state) => state.dbUser);
  const query = useQuery<OrganisationPermissionsData>(ORGANISATION_PERMISSIONS, {
    skip: !signedIn,
    fetchPolicy: 'cache-and-network',
  });
  const roles = query.data?.me?.roles ?? storedUser?.roles ?? [];
  const hasResolvedUser = Boolean(query.data?.me || storedUser);

  return {
    roles,
    canManageSettings: canManageOrganisationSettings(roles),
    canManageLifecycle: canManageOrganisationLifecycle(roles),
    loading: signedIn && query.loading && !hasResolvedUser,
    error: !hasResolvedUser ? query.error : undefined,
    refetch: query.refetch,
  };
}
