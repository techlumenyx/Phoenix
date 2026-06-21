import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseApp = initializeApp({
  apiKey: process.env['CL_FIREBASE_API_KEY'],
  authDomain: process.env['CL_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['CL_FIREBASE_PROJECT_ID'],
  appId: process.env['CL_FIREBASE_APP_ID'],
});

export const firebaseAuth = getAuth(firebaseApp);
