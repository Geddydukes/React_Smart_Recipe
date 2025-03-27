import { supabase } from '@/lib/supabase';

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

export class AuthService {
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      throw error;
    }
  }

  async signIn(credentials: SignInCredentials) {
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return user;
  }

  async signUp(data: SignUpData) {
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });
    if (error) throw error;
    return user;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async updateProfile(data: ProfileData) {
    const {
      data: { user },
      error,
    } = await supabase.auth.updateUser({
      data,
    });
    if (error) throw error;
    return user;
  }
}

export const authService = new AuthService();
