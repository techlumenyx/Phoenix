import type { DecodedIdToken } from 'firebase-admin/auth';
import { getFirebaseAdmin } from './firebase-admin';

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken> {
  try {
    return await getFirebaseAdmin().auth().verifyIdToken(idToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired Firebase token');
  }
}
