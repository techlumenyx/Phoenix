import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { firebaseAuth } from '../firebase';
import { userSafeError } from '../lib/user-safe-error';

export default function OrgSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      }
      navigate('/org/setup', { replace: true });
    } catch (err: unknown) {
      setError(userSafeError(err, 'Authentication failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      navigate('/org/setup', { replace: true });
    } catch (err: unknown) {
      setError(userSafeError(err, 'Google sign in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-1">Organisation Account</h1>
        <p className="text-sm text-gray-500 mb-6">Sign up or sign in to manage your organisation.</p>

        <div className="flex rounded-xl overflow-hidden mb-5" style={{ background: '#ede9e4' }}>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
              mode === 'signup' ? 'bg-[#1a1007] text-white shadow' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
              mode === 'signin' ? 'bg-[#1a1007] text-white shadow' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="org-email">Email</label>
            <input
              id="org-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="org@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="org-password">Password</label>
            <input
              id="org-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
              placeholder="Min. 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 rounded-full bg-[#C9A96E] text-[#1B1B1B] text-sm font-semibold hover:bg-[#b8965e] transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Continue' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
