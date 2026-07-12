import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { gql, useQuery } from '@apollo/client';

const ORG_ACCESS_QUERY = gql`query OrganisationRouteAccess { myOrganisations { id } }`;

export default function OrgProtectedRoute({ children }: { children: ReactNode }) {
  const { user, dbUser, accountType, initialized } = useAuthStore();
  const location = useLocation();
  const { data, loading } = useQuery<{ myOrganisations: { id: string }[] }>(ORG_ACCESS_QUERY, { skip: !user });
  if (!initialized) return <div className="flex min-h-screen items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-4 border-[#C9A96E] border-t-transparent" /></div>;
  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />;
  if (loading) return <div className="flex min-h-screen items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-4 border-[#C9A96E] border-t-transparent" /></div>;
  const hasOrganisationAccess = accountType === 'organisation' || Boolean(dbUser?.orgId && dbUser.roles.length) || Boolean(data?.myOrganisations.length);
  if (!hasOrganisationAccess) return <Navigate to="/org/signup" replace />;
  return <>{children}</>;
}
