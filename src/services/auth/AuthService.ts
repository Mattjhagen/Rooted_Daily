import { supabase } from '../supabase';
import { AuthResponse, User } from '@supabase/supabase-js';

export class AuthService {
  /**
   * sign up with email/password
   */
  static async signUp(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signUp({
      email,
      password,
    });
  }

  /**
   * sign in with email/password
   */
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  /**
   * sign out
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  /**
   * subscribe to auth changes
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * reset password
   */
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
}
