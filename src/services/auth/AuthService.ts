import { supabase } from '../supabase';
import { AuthResponse, User } from '@supabase/supabase-js';

const SUPABASE_NOT_CONFIGURED_ERROR = 'Supabase not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env';

export class AuthService {
  /**
   * sign up with email/password
   */
  static async signUp(email: string, password: string): Promise<AuthResponse> {
    if (!supabase) throw new Error(SUPABASE_NOT_CONFIGURED_ERROR);
    return await supabase.auth.signUp({
      email,
      password,
    });
  }

  /**
   * sign in with email/password
   */
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!supabase) throw new Error(SUPABASE_NOT_CONFIGURED_ERROR);
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  /**
   * sign out
   */
  static async signOut(): Promise<void> {
    if (!supabase) throw new Error(SUPABASE_NOT_CONFIGURED_ERROR);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  /**
   * update user metadata
   */
  static async updateUserMetadata(data: any): Promise<void> {
    if (!supabase) throw new Error(SUPABASE_NOT_CONFIGURED_ERROR);
    const { error } = await supabase.auth.updateUser({ data });
    if (error) throw error;
  }

  /**
   * subscribe to auth changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    if (!supabase) {
      // Return a dummy subscription that does nothing
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * reset password
   */
  static async resetPassword(email: string): Promise<void> {
    if (!supabase) throw new Error(SUPABASE_NOT_CONFIGURED_ERROR);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
}
