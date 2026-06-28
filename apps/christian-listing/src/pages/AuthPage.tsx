import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { firebaseAuth } from '../firebase';
import { useAuthStore } from '../store/authStore';
import SceneHeader from '../components/layout/SceneHeader';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, dbUser, initialized } = useAuthStore();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
  const defaultTab = location.pathname === '/signin' ? 'signin' : 'signup';

  const [tab, setTab]         = useState<'signup' | 'signin'>(defaultTab);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // All hooks declared — safe to early-return now
  if (initialized && user) {
    return <Navigate to={dbUser?.onboardingCompleted ? from : '/onboarding/region'} replace />;
  }

  function switchTab(t: 'signup' | 'signin') {
    setTab(t);
    setError('');
    navigate(t === 'signup' ? '/signup' : '/signin', { replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signup') {
        const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await updateProfile(user, { displayName: name });
        navigate('/onboarding/region', { replace: true });
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      navigate(tab === 'signup' ? '/onboarding/region' : from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center px-4 py-10 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        <SceneHeader onClose={() => navigate('/')} />

        <div className="px-7 pb-7 pt-5">
          <h1 className="text-2xl font-serif font-bold text-[#1B1B1B] mb-0.5">
            {tab === 'signup' ? 'Join the Sanctuary' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-gray-500 mb-5">
            Discover Events, Jobs &amp; Deals all in one place, without the clutter
          </p>

          {/* Tab toggle */}
          <div className="flex rounded-full bg-[#F5F0EB] p-1 mb-5">
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === 'signup' ? 'bg-[#1B1B1B] text-white' : 'text-gray-500'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                tab === 'signin' ? 'bg-[#1B1B1B] text-white' : 'text-gray-500'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <p className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {tab === 'signup' && (
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-[#F5F0EB] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#C9A96E]"
              />
            )}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-[#F5F0EB] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#C9A96E]"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••"
              className="w-full bg-[#F5F0EB] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#C9A96E]"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 rounded-xl bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loading ? '…' : tab === 'signup' ? 'Create Account' : 'Sign In to Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">or sign-{tab === 'signup' ? 'up' : 'in'} with</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#1B1B1B] text-white text-xs font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              Google Account
            </button>
            <button
              disabled
              className="flex-1 py-2.5 rounded-xl bg-[#1B1B1B] text-white text-xs font-semibold opacity-40 cursor-not-allowed"
            >
              Facebook ID
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-[#C9A96E] font-medium">
            <Link to="/org/signup">
              {tab === 'signup'
                ? 'Are you an Organization? Sign Up as an Org. +'
                : 'Are you an Organization? Sign In as an Org. →'}
            </Link>
          </p>

          {tab === 'signup' && (
            <p className="mt-3 text-center text-[10px] text-gray-400">
              By joining, you agree to our{' '}
              <span className="underline cursor-pointer">Terms Of Service</span> and{' '}
              <span className="underline cursor-pointer">Privacy Policy</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
