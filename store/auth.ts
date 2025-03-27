import { create } from 'zustand';
import { authService } from '@/services/auth';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name: string;
    [key: string]: any;
  };
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpData extends SignInCredentials {
  name: string;
}

interface ProfileData {
  name: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const user = await authService.getCurrentUser();
      set({ user, loading: false });
    } catch (error) {
      set({
        user: null,
        error: 'Failed to check authentication status',
        loading: false,
      });
    }
  },

  signIn: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const user = await authService.signIn(credentials);
      set({ user, loading: false });
    } catch (error) {
      set({
        error: 'Failed to sign in',
        loading: false,
      });
      throw error;
    }
  },

  signUp: async (data) => {
    try {
      set({ loading: true, error: null });
      const user = await authService.signUp(data);
      set({ user, loading: false });
    } catch (error) {
      set({
        error: 'Failed to sign up',
        loading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await authService.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({
        error: 'Failed to sign out',
        loading: false,
      });
      throw error;
    }
  },

  resetPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await authService.resetPassword(email);
      set({ loading: false });
    } catch (error) {
      set({
        error: 'Failed to reset password',
        loading: false,
      });
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      set({ loading: true, error: null });
      const user = await authService.updateProfile(data);
      set({ user, loading: false });
    } catch (error) {
      set({
        error: 'Failed to update profile',
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
