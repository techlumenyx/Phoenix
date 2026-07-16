import { useAdminAuth } from '../auth/authStore';

export default function UnauthorizedPage() {
  const { user, logout } = useAdminAuth();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FA] px-6">
      <section className="w-full max-w-md rounded-lg border border-[#DFE1E6] bg-white p-8 shadow-sm">
        <span className="grid h-10 w-10 place-items-center rounded bg-red-50 text-lg text-red-700" aria-hidden="true">!</span>
        <h1 className="mt-5 text-xl font-semibold text-[#172B4D]">Admin access required</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{user?.email ? `${user.email} is signed in, but` : 'This account'} does not have an active Christian Listings administrator profile.</p>
        <button type="button" onClick={() => void logout()} className="mt-6 h-9 rounded bg-[#0C66E4] px-4 text-sm font-semibold text-white hover:bg-blue-700">Sign out</button>
      </section>
    </main>
  );
}
