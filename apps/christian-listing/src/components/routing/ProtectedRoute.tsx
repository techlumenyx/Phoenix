import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute() {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  // Hold render until Firebase resolves the initial auth state
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Preserve the intended destination so we can redirect back after sign-in
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
