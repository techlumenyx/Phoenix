import { useState, FormEvent } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { firebaseAuth } from '../../firebase';
import { useAuthStore } from '../../store/authStore';
import SceneHeader from '../../components/layout/SceneHeader';

const INPUT =
  'w-full bg-[#ede9e4] rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#C9A96E] transition';
const DARK_BTN =
  'w-full py-2.5 rounded-xl bg-[#1a1007] text-white text-sm font-semibold hover:bg-[#2d1e0d] transition-colors disabled:opacity-50';

export default function OrgAuthPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();

  const [tab, setTab]           = useState<'signup' | 'signin'>('signup');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (initialized && user) {
    return <Navigate to="/org" replace />;
  }

  function switchTab(next: 'signup' | 'signin') {
    setTab(next);
    setError('');
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      navigate('/org/onboarding/identity');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      navigate('/org');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      navigate('/org/onboarding/identity');
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
          <h1 className="text-2xl font-serif font-bold text-[#1a1007] mb-0.5">
            {tab === 'signup' ? 'List your organization' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-gray-500 mb-4">
            Engage with the community, add new listings and grow your tribe
          </p>

          {/* Tab toggle */}
          <div className="flex rounded-xl overflow-hidden mb-4" style={{ background: '#ede9e4' }}>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                tab === 'signup' ? 'bg-[#1a1007] text-white shadow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                tab === 'signin' ? 'bg-[#1a1007] text-white shadow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Email Address *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@mail.com" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Phone Number *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 12343355" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••••" className={INPUT} />
              </div>
              <button type="submit" disabled={loading} className={`${DARK_BTN} mt-1`}>
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </form>
          )}

          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@mail.com" className={INPUT} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••••" className={INPUT} />
              </div>
              <button type="submit" disabled={loading} className={`${DARK_BTN} mt-1`}>
                {loading ? 'Signing in…' : 'Sign In to your account →'}
              </button>
            </form>
          )}

          {tab === 'signup' && (
            <>
              <div className="flex items-center gap-3 my-3">
                <hr className="flex-1 border-gray-200" />
                <span className="text-[10px] tracking-widest font-medium text-gray-400 uppercase">or</span>
                <hr className="flex-1 border-gray-200" />
              </div>
              <button onClick={handleGoogle} disabled={loading} className={DARK_BTN}>
                {loading ? 'Please wait…' : 'Continue with Google'}
              </button>
            </>
          )}

          <p className="mt-4 text-center text-xs text-gray-500">
            <Link
              to={tab === 'signup' ? '/signup' : '/signin'}
              className="underline underline-offset-2 hover:text-gray-700"
            >
              {tab === 'signup'
                ? 'Are you a general user? Sign Up as a User →'
                : 'Are you a general user? Sign In as a User →'}
            </Link>
          </p>

          {tab === 'signup' && (
            <p className="mt-3 text-center text-[10px] text-gray-400 leading-relaxed">
              By joining, you agree to our{' '}
              <Link to="/terms" className="font-semibold text-gray-600 hover:underline">Terms Of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="font-semibold text-gray-600 hover:underline">Privacy Policy</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
