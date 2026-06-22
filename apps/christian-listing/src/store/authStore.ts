import { create } from 'zustand';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { firebaseAuth } from '../firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  logout: async () => {
    await signOut(firebaseAuth);
  },
}));

// Subscribe to Firebase auth state once at module load
onAuthStateChanged(firebaseAuth, (user) => {
  useAuthStore.setState({ user, loading: false, initialized: true });
});
