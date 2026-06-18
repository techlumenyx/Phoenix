import * as admin from 'firebase-admin';

let app: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT_JSON'];
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountJson, 'base64').toString('utf-8'),
  ) as admin.ServiceAccount;

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return app;
}
