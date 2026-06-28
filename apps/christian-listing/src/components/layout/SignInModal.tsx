import { useState, FormEvent, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SceneHeader from './SceneHeader';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from '../../firebase';

interface Props {
  onClose: () => void;
  defaultTab?: 'signup' | 'signin';
}


const INPUT =
  'w-full bg-[#ede9e4] rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#C9A96E] transition';

const DARK_BTN =
  'w-full py-2.5 rounded-xl bg-[#1a1007] text-white text-sm font-semibold hover:bg-[#2d1e0d] transition-colors disabled:opacity-50';

export default function SignInModal({ onClose, defaultTab = 'signup' }: Props) {
  const [tab, setTab] = useState<'signup' | 'signin'>(defaultTab);

  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [close]);

  function switchTab(next: 'signup' | 'signin') {
    setTab(next);
    setError('');
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, signupEmail, signupPassword);
      if (fullName) await updateProfile(user, { displayName: fullName });
      close();
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
      await signInWithEmailAndPassword(firebaseAuth, signinEmail, signinPassword);
      close();
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
      close();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFacebook() {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, new FacebookAuthProvider());
      close();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Facebook sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={tab === 'signup' ? 'Sign up' : 'Sign in'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <SceneHeader onClose={close} />

        <div className="px-6 pb-4 overflow-y-hidden">
          {/* Heading */}
          <h2 className="text-2xl font-serif font-bold text-[#1a1007] mt-4 mb-0.5">
            Join the Sanctuary
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Discover Events, Jobs &amp; Deals all in one place, without the clutter
          </p>

          {/* Tab toggle */}
          <div className="flex rounded-xl overflow-hidden mb-3" style={{ background: '#ede9e4' }}>
            <button
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                tab === 'signup'
                  ? 'bg-[#1a1007] text-white shadow'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => switchTab('signin')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                tab === 'signin'
                  ? 'bg-[#1a1007] text-white shadow'
                  : 'text-gray-400 hover:text-gray-600'
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

          {/* Sign Up form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className={INPUT}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Email Address</label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="email@mail.com"
                  className={INPUT}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Password</label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className={INPUT}
                />
              </div>
              <button type="submit" disabled={loading} className={`${DARK_BTN} mt-1`}>
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Sign In form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Email Address</label>
                <input
                  type="email"
                  required
                  value={signinEmail}
                  onChange={(e) => setSigninEmail(e.target.value)}
                  placeholder="email@mail.com"
                  className={INPUT}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Password</label>
                <input
                  type="password"
                  required
                  value={signinPassword}
                  onChange={(e) => setSigninPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className={INPUT}
                />
              </div>
              <button type="submit" disabled={loading} className={`${DARK_BTN} mt-1`}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <hr className="flex-1 border-gray-200" />
            <span className="text-[10px] tracking-widest font-medium text-gray-400 uppercase">
              or sign-up with
            </span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="py-2.5 rounded-xl bg-[#1a1007] text-white text-xs font-semibold hover:bg-[#2d1e0d] transition-colors disabled:opacity-50"
            >
              Google Account
            </button>
            <button
              onClick={handleFacebook}
              disabled={loading}
              className="py-2.5 rounded-xl bg-[#1a1007] text-white text-xs font-semibold hover:bg-[#2d1e0d] transition-colors disabled:opacity-50"
            >
              Facebook ID
            </button>
          </div>

          {/* Org link */}
          <p className="mt-3 text-center text-xs text-gray-500">
            <Link
              to="/org/signup"
              onClick={close}
              className="underline underline-offset-2 hover:text-gray-700"
            >
              Are you an Organization ? Sign Up as an Org. →
            </Link>
          </p>

          {/* Legal */}
          <p className="mt-2 text-center text-[10px] text-gray-400 leading-relaxed">
            By joining, you agree to our{' '}
            <Link
              to="/terms"
              onClick={close}
              className="font-semibold text-gray-600 hover:underline"
            >
              Terms Of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              onClick={close}
              className="font-semibold text-gray-600 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
