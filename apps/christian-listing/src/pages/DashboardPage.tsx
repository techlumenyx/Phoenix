import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Welcome back, {user?.displayName ?? user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="px-5 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'My Applications', href: '/dashboard/applications' },
          { label: 'Saved Items', href: '/dashboard/saved' },
          { label: 'Following', href: '/dashboard/following' },
          { label: 'Messages', href: '/dashboard/messages' },
          { label: 'Browse Opportunities', href: '/jobs/all' },
          { label: 'My Profile', href: '/profile' },
        ].map(({ label, href }) => (
          <Link
            key={label}
            to={href}
            className="block p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            <span className="text-base font-semibold text-gray-800">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
