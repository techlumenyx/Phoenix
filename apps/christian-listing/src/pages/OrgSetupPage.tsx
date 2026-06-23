import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { getAuth } from 'firebase/auth';
import { useAuthStore } from '../store/authStore';
import { MY_ORGANISATIONS, CREATE_ORGANISATION } from '../graphql/mutations';

export default function OrgSetupPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, loading: queryLoading } = useQuery(MY_ORGANISATIONS, {
    skip: !user,
  });

  const [createOrganisation] = useMutation(CREATE_ORGANISATION);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      navigate('/org/signup', { replace: true });
    }
  }, [initialized, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await createOrganisation({ variables: { input: { name: orgName.trim() } } });
      await getAuth().currentUser?.getIdToken(true);
      useAuthStore.setState({ accountType: 'organisation', orgSetupChecked: true });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Setup failed — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!initialized || queryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading…</span>
      </div>
    );
  }

  const orgs: { id: string; name: string | null }[] = data?.myOrganisations ?? [];
  const hasName = orgs.some((o) => o.name && o.name.trim().length > 0);
  if (hasName) {
    useAuthStore.setState({ orgSetupChecked: true });
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">Name your organisation</h1>
        <p className="text-sm text-gray-500 mb-6">
          This is how your organisation appears on Christian Listings. You can update it later.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="org-name">
              Organisation name
            </label>
            <input
              id="org-name"
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="e.g. Grace Community Church"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !orgName.trim()}
            className="mt-2 w-full py-2.5 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold hover:bg-[#b8965e] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
