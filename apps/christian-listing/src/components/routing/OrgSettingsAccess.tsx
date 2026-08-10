import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import DirectoryState from '../ui/DirectoryState';
import { useOrganisationPermissions } from '../../hooks/useOrganisationPermissions';

export default function OrgSettingsAccess({ children }: { children: ReactNode }) {
  const { canManageSettings, loading, error, refetch } = useOrganisationPermissions();

  if (loading) {
    return <div className="mx-auto max-w-5xl p-6"><DirectoryState kind="loading" /></div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <DirectoryState
          kind="error"
          title="Settings access could not be checked"
          detail="Please retry. If the problem continues, contact your organisation owner."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!canManageSettings) {
    return (
      <main className="mx-auto w-full max-w-5xl p-6 text-[#1B1B1B]">
        <div role="alert" className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Restricted area</p>
          <h1 className="mt-3 font-serif text-3xl font-bold">Settings access denied</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
            Only the organisation owner or a site administrator can manage organisation settings.
            Contact one of them if a change is required.
          </p>
          <Link to="/org" className="mt-6 inline-flex rounded-lg bg-[#302D2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Return to overview
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
