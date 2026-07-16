import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './authStore';

export default function AdminProtectedRoute() {
  const { user, admin, initialized, accessDenied } = useAdminAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50" aria-busy="true">
        <div className="text-center">
          <span className="mx-auto block h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-600">Verifying admin access…</p>
        </div>
      </main>
    );
  }

  if (accessDenied) return <Navigate to="/unauthorised" replace />;
  if (!user || !admin) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
