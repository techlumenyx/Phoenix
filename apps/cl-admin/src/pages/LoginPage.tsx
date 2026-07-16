import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../auth/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, admin, initialized, signingIn, accessDenied, error, login, clearError } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  useEffect(() => {
    clearError();
  }, [clearError]);
  useEffect(() => {
    if (initialized && user && admin) navigate(from, { replace: true });
  }, [admin, from, initialized, navigate, user]);

  if (initialized && accessDenied) return <Navigate to="/unauthorised" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      await login(email, password);
    } catch {
      // The auth store exposes a safe, user-facing error.
    }
  }

  return (
    <main className="grid min-h-screen bg-[#F7F8FA] lg:grid-cols-[minmax(0,1fr)_480px]">
      <section className="hidden bg-[#172B4D] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded bg-blue-500 text-sm font-bold">CL</span>
          <div><p className="font-semibold">Christian Listings</p><p className="text-xs text-slate-300">Administration</p></div>
        </div>
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Operations workspace</p>
          <h1 className="text-4xl font-semibold leading-tight">Keep the community safe, trusted, and well supported.</h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">Review platform work from one secure place. Every privileged action is permission-controlled and auditable.</p>
        </div>
        <p className="text-xs text-slate-400">Authorised Christian Listings staff only</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded bg-[#172B4D] text-xs font-bold text-white">CL</span>
            <p className="text-sm font-semibold text-[#172B4D]">Christian Listings Admin</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Staff access</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#172B4D]">Sign in to administration</h2>
          <p className="mt-2 text-sm leading-5 text-slate-600">Use your provisioned staff account. Community and organisation accounts cannot access this portal.</p>
          <form className="mt-8 space-y-5" onSubmit={submit}>
            <label className="block text-sm font-medium text-[#172B4D]">Email address
              <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 h-10 w-full rounded border border-[#B7BEC8] bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="block text-sm font-medium text-[#172B4D]">Password
              <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 h-10 w-full rounded border border-[#B7BEC8] bg-white px-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </label>
            {error && <div role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</div>}
            <button type="submit" disabled={signingIn} className="h-10 w-full rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{signingIn ? 'Verifying access…' : 'Sign in'}</button>
          </form>
          <p className="mt-6 text-xs leading-5 text-slate-500">Access is logged and monitored. Contact a super administrator if your account has not been provisioned.</p>
        </div>
      </section>
    </main>
  );
}
