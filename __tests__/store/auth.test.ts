import { act } from '@testing-library/react-native';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth';

// Mock auth service
jest.mock('@/services/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

describe('Auth Store', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.setState({
        user: null,
        loading: false,
        error: null,
      });
    });
  });

  describe('checkAuth', () => {
    it('should set user if authenticated', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should set user to null if not authenticated', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValueOnce(null);

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should handle auth check error', async () => {
      const error = new Error('Auth check failed');
      (authService.getCurrentUser as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        await useAuthStore.getState().checkAuth();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBe(
        'Failed to check authentication status'
      );
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe('signIn', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should sign in user successfully', async () => {
      (authService.signIn as jest.Mock).mockResolvedValueOnce(mockUser);

      await act(async () => {
        await useAuthStore.getState().signIn(credentials);
      });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should handle sign in error', async () => {
      const error = new Error('Invalid credentials');
      (authService.signIn as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useAuthStore.getState().signIn(credentials);
        } catch (e) {
          // Error is expected
        }
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBe('Failed to sign in');
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe('signUp', () => {
    const signUpData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should sign up user successfully', async () => {
      (authService.signUp as jest.Mock).mockResolvedValueOnce(mockUser);

      await act(async () => {
        await useAuthStore.getState().signUp(signUpData);
      });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should handle sign up error', async () => {
      const error = new Error('Registration failed');
      (authService.signUp as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useAuthStore.getState().signUp(signUpData);
        } catch (e) {
          // Error is expected
        }
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBe('Failed to sign up');
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      act(() => {
        useAuthStore.setState({ user: mockUser });
      });

      await act(async () => {
        await useAuthStore.getState().signOut();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should handle sign out error', async () => {
      const error = new Error('Sign out failed');
      (authService.signOut as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useAuthStore.getState().signOut();
        } catch (e) {
          // Error is expected
        }
      });

      expect(useAuthStore.getState().error).toBe('Failed to sign out');
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe('resetPassword', () => {
    const email = 'test@example.com';

    it('should reset password successfully', async () => {
      await act(async () => {
        await useAuthStore.getState().resetPassword(email);
      });

      expect(authService.resetPassword).toHaveBeenCalledWith(email);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should handle reset password error', async () => {
      const error = new Error('Reset password failed');
      (authService.resetPassword as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useAuthStore.getState().resetPassword(email);
        } catch (e) {
          // Error is expected
        }
      });

      expect(useAuthStore.getState().error).toBe('Failed to reset password');
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });

  describe('updateProfile', () => {
    const updates = {
      name: 'Updated Name',
    };

    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUser, user_metadata: updates };
      (authService.updateProfile as jest.Mock).mockResolvedValueOnce(
        updatedUser
      );

      await act(async () => {
        await useAuthStore.getState().updateProfile(updates);
      });

      expect(useAuthStore.getState().user).toEqual(updatedUser);
      expect(useAuthStore.getState().loading).toBe(false);
      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should handle update profile error', async () => {
      const error = new Error('Update failed');
      (authService.updateProfile as jest.Mock).mockRejectedValueOnce(error);

      await act(async () => {
        try {
          await useAuthStore.getState().updateProfile(updates);
        } catch (e) {
          // Error is expected
        }
      });

      expect(useAuthStore.getState().error).toBe('Failed to update profile');
      expect(useAuthStore.getState().loading).toBe(false);
    });
  });
});
