import { create } from 'zustand';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { gql } from '@apollo/client';
import { firebaseAuth } from '../firebase';
import { apolloClient } from '../apolloClient';

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      avatarUrl
      isVerified
      onboardingCompleted
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
  } catch (err) {
    console.error('[authStore] me query failed — is the backend running?', err);
  }
});
