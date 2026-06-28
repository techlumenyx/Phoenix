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
  accountType: string | null;
  orgSetupChecked: boolean;
  loading: boolean;
  initialized: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  dbUser: null,
  accountType: null,
  orgSetupChecked: false,
  loading: true,
  initialized: false,

  logout: async () => {
    await signOut(firebaseAuth);
    apolloClient.clearStore();
  },
}));

onAuthStateChanged(firebaseAuth, async (user) => {
  if (!user) {
    useAuthStore.setState({ user: null, dbUser: null, accountType: null, orgSetupChecked: false, loading: false, initialized: true });
    return;
  }

  const tokenResult = await user.getIdTokenResult();
  const accountType = (tokenResult.claims['accountType'] as string) ?? null;

  useAuthStore.setState({ user, accountType, orgSetupChecked: false, loading: false, initialized: true });

  try {
    const { data } = await apolloClient.query<{ me: DbUser }>({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    });
    useAuthStore.setState({ dbUser: data.me });

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
