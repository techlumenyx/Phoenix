const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account already exists for this email address.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/invalid-credential': 'The email address or password is incorrect.',
  'auth/user-not-found': 'The email address or password is incorrect.',
  'auth/wrong-password': 'The email address or password is incorrect.',
  'auth/weak-password': 'Choose a stronger password with at least six characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Check your internet connection and try again.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before sign-in completed.',
};

/** Returns only explicitly approved client-facing messages, never a raw server error. */
export function userSafeError(error: unknown, fallback: string): string {
  const code = getErrorCode(error);
  return (code && AUTH_ERROR_MESSAGES[code]) || fallback;
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('code' in error)) return undefined;
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? code : undefined;
}
