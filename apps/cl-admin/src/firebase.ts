import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseApp = getApps().some((app) => app.name === 'cl-admin')
  ? getApp('cl-admin')
  : initializeApp(
      {
        apiKey: process.env['CL_FIREBASE_API_KEY'],
        authDomain: process.env['CL_FIREBASE_AUTH_DOMAIN'],
        projectId: process.env['CL_FIREBASE_PROJECT_ID'],
        appId: process.env['CL_FIREBASE_APP_ID_ADMIN'] ?? process.env['CL_FIREBASE_APP_ID'],
      },
      'cl-admin',
    );

export const firebaseAuth = getAuth(firebaseApp);
