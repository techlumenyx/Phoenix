import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseApp = initializeApp({
  apiKey: process.env['VITE_FIREBASE_API_KEY'],
  authDomain: process.env['VITE_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['VITE_FIREBASE_PROJECT_ID'],
  appId: process.env['VITE_FIREBASE_APP_ID'],
});

export const firebaseAuth = getAuth(firebaseApp);
