import { create } from 'zustand';
import { onIdTokenChanged, signOut, User } from 'firebase/auth';
import { firebaseAuth } from '../firebase';

interface AuthState {
  user: User | null;
  accountType: string | null;
  /** True once OrgSetupPage has confirmed the org has a name this session. Resets on page refresh. */
  orgSetupChecked: boolean;
  loading: boolean;
  initialized: boolean;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accountType: null,
  orgSetupChecked: false,
  loading: true,
  initialized: false,

  logout: async () => {
    await signOut(firebaseAuth);
  },
}));

onIdTokenChanged(firebaseAuth, async (user) => {
  if (user) {
    const result = await user.getIdTokenResult();
    const accountType = (result.claims['accountType'] as string) ?? null;
    // Reset orgSetupChecked on every login so OrgSetupPage re-validates each session.
    useAuthStore.setState({ user, accountType, orgSetupChecked: false, loading: false, initialized: true });
  } else {
    useAuthStore.setState({ user: null, accountType: null, orgSetupChecked: false, loading: false, initialized: true });
  }
});
