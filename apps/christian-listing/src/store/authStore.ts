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
      region
      preferences
      roles
      orgId
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
  region: string;
  preferences: string[];
  roles: string[];
  orgId: string | null;
}

interface AuthState {
  user: User | null;
  dbUser: DbUser | null;
  accountType: string | null;
  loading: boolean;
  initialized: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  dbUser: null,
  accountType: null,
  loading: true,
  initialized: false,

  logout: async () => {
    await signOut(firebaseAuth);
    apolloClient.clearStore();
  },
}));

onAuthStateChanged(firebaseAuth, async (user) => {
  if (!user) {
    useAuthStore.setState({ user: null, dbUser: null, accountType: null, loading: false, initialized: true });
    return;
  }

  const tokenResult = await user.getIdTokenResult();
  const accountType = (tokenResult.claims['accountType'] as string) ?? null;

  useAuthStore.setState({ user, accountType, loading: false, initialized: true });

  try {
    const { data } = await apolloClient.query<{ me: DbUser }>({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    });
    useAuthStore.setState({ dbUser: data.me });

    // Org users have their own onboarding path (/org/onboarding/*) — skip this redirect for them.
    if (accountType !== 'organisation' && !data.me?.onboardingCompleted) {
      const current = window.location.pathname;
      if (!ONBOARDING_PATHS.some((p) => current.startsWith(p))) {
        window.location.replace('/onboarding/region');
      }
    }
  } catch (err) {
    console.error('[authStore] me query failed — is the backend running?', err);
  }
});
