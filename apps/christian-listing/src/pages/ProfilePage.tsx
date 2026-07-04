import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate('/');
  }

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-12">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Name</p>
          <p className="text-sm text-gray-800 mt-0.5">{user?.displayName ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</p>
          <p className="text-sm text-gray-800 mt-0.5">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Account ID</p>
          <p className="text-sm text-gray-800 mt-0.5 font-mono">{user?.uid}</p>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="px-5 py-2 rounded-full border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
