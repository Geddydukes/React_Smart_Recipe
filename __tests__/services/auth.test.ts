import { AuthService } from '@/services/auth';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is logged in', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should handle errors', async () => {
      (supabase.auth.getUser as jest.Mock).mockRejectedValue(
        new Error('Auth error')
      );

      await expect(authService.getCurrentUser()).rejects.toThrow('Auth error');
    });
  });

  describe('signIn', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should sign in user successfully', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.signIn(credentials);

      expect(result).toEqual(mockUser);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(
        credentials
      );
    });

    it('should handle invalid credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid credentials'),
      });

      await expect(authService.signIn(credentials)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('signUp', () => {
    const signUpData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should sign up user successfully', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.signUp(signUpData);

      expect(result).toEqual(mockUser);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            name: signUpData.name,
          },
        },
      });
    });

    it('should handle registration error', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Registration failed'),
      });

      await expect(authService.signUp(signUpData)).rejects.toThrow(
        'Registration failed'
      );
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      await authService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: new Error('Sign out failed'),
      });

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('resetPassword', () => {
    const email = 'test@example.com';

    it('should send reset password email successfully', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: {},
        error: null,
      });

      await authService.resetPassword(email);

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email);
    });

    it('should handle reset password error', async () => {
      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: null,
        error: new Error('Reset password failed'),
      });

      await expect(authService.resetPassword(email)).rejects.toThrow(
        'Reset password failed'
      );
    });
  });

  describe('updateProfile', () => {
    const updates = {
      name: 'Updated Name',
    };

    it('should update user profile successfully', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: { ...mockUser, user_metadata: updates } },
        error: null,
      });

      const result = await authService.updateProfile(updates);

      expect(result).toEqual({ ...mockUser, user_metadata: updates });
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: updates,
      });
    });

    it('should handle update profile error', async () => {
      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Update failed'),
      });

      await expect(authService.updateProfile(updates)).rejects.toThrow(
        'Update failed'
      );
    });
  });
});
