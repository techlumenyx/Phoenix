import { sendPasswordResetEmail } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { firebaseAuth } from '../../firebase';

interface ForgotPasswordActionProps {
  email: string;
  className?: string;
}

export default function ForgotPasswordAction({ email, className = '' }: ForgotPasswordActionProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setMessage('');
    setIsError(false);
  }, [email]);

  async function requestReset() {
    const address = email.trim();
    if (!address || !/^\S+@\S+\.\S+$/.test(address)) {
      setIsError(true);
      setMessage('Enter your email address above first.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      await sendPasswordResetEmail(firebaseAuth, address);
      setMessage('If an account exists for this email, a password reset link has been sent.');
    } catch {
      setIsError(true);
      setMessage('We couldn’t send the reset link. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={loading}
        onClick={() => void requestReset()}
        className="text-xs font-semibold text-[#7a5c30] underline-offset-2 hover:underline disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? 'Sending reset link…' : 'Forgot password?'}
      </button>
      {message && (
        <p
          role="status"
          className={`mt-2 rounded-lg border px-3 py-2 text-xs leading-5 ${
            isError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-800'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
