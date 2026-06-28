import { create } from 'zustand';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { gql } from '@apollo/client';
import { firebaseAuth } from '../firebase';
import { apolloClient } from '../apolloClient';

const ONBOARDING_PATHS = ['/onboarding', '/org/onboarding', '/org/signup', '/signup', '/signin'];

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      avatarUrl
      isVerified
      onboardingCompleted
      preferences
    }
  }
`;

export interface DbUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isVerified: boolean;
  onboardingCompleted: boolean;
  preferences: string[];
}

interface AuthState {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  initialized: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  dbUser: null,
  loading: true,
  initialized: false,

  logout: async () => {
    await signOut(firebaseAuth);
    apolloClient.clearStore();
  },
}));

onAuthStateChanged(firebaseAuth, async (user) => {
  if (!user) {
    useAuthStore.setState({ user: null, dbUser: null, loading: false, initialized: true });
    return;
  }

  useAuthStore.setState({ user, loading: false, initialized: true });

  // Upsert the MongoDB user — creates the document on first login
  try {
    const { data } = await apolloClient.query<{ me: DbUser }>({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    });
    useAuthStore.setState({ dbUser: data.me });

    // Redirect to onboarding if not yet completed and not already on an onboarding path
    if (!data.me?.onboardingCompleted) {
      const current = window.location.pathname;
      if (!ONBOARDING_PATHS.some((p) => current.startsWith(p))) {
        window.location.replace('/onboarding/region');
      }
    }
  } catch (err) {
    console.error('[authStore] me query failed — is the backend running?', err);
  }
});
