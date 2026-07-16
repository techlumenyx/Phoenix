import { gql } from '@apollo/client';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { create } from 'zustand';
import { adminApolloClient } from '../apollo/client';
import { firebaseAuth } from '../firebase';

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'TRUST_SAFETY'
  | 'VERIFICATION_REVIEWER'
  | 'CONTENT_MANAGER'
  | 'SUPPORT_AGENT'
  | 'ANALYST'
  | 'AUDITOR';

export interface AdminProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  roles: AdminRole[];
  status: 'ACTIVE' | 'DISABLED';
}

const ADMIN_ME = gql`
  query AdminMe {
    adminMe {
      id
      firebaseUid
      email
      name
      roles
      status
    }
  }
`;

interface AuthState {
  user: User | null;
  admin: AdminProfile | null;
  initialized: boolean;
  signingIn: boolean;
  accessDenied: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAdminAuth = create<AuthState>((set) => ({
  user: null,
  admin: null,
  initialized: false,
  signingIn: false,
  accessDenied: false,
  error: null,
  login: async (email, password) => {
    set({ signingIn: true, error: null, accessDenied: false });
    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    } catch (error) {
      const code = (error as { code?: string }).code;
      set({
        signingIn: false,
        error: code === 'auth/invalid-credential'
          ? 'Email or password is incorrect.'
          : 'Sign-in failed. Check your connection and try again.',
      });
      throw error;
    }
  },
  logout: async () => {
    await signOut(firebaseAuth);
    await adminApolloClient.clearStore();
    set({ admin: null, accessDenied: false, error: null });
  },
  clearError: () => set({ error: null }),
}));

onAuthStateChanged(firebaseAuth, async (user) => {
  if (!user) {
    useAdminAuth.setState({
      user: null,
      admin: null,
      initialized: true,
      signingIn: false,
      accessDenied: false,
    });
    return;
  }

  useAdminAuth.setState({ user, initialized: false, error: null });

  try {
    const token = await user.getIdTokenResult();
    if (token.claims['accountType'] !== 'admin') {
      useAdminAuth.setState({
        admin: null,
        initialized: true,
        signingIn: false,
        accessDenied: true,
      });
      return;
    }

    const result = await adminApolloClient.query<{ adminMe: AdminProfile | null }>({
      query: ADMIN_ME,
      fetchPolicy: 'network-only',
    });

    if (!result.data.adminMe || result.data.adminMe.status !== 'ACTIVE') {
      useAdminAuth.setState({
        admin: null,
        initialized: true,
        signingIn: false,
        accessDenied: true,
      });
      return;
    }

    useAdminAuth.setState({
      admin: result.data.adminMe,
      initialized: true,
      signingIn: false,
      accessDenied: false,
    });
  } catch {
    useAdminAuth.setState({
      admin: null,
      initialized: true,
      signingIn: false,
      accessDenied: true,
      error: 'Your admin access could not be verified.',
    });
  }
});
