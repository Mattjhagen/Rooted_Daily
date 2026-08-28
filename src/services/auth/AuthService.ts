import { supabase } from '../supabase';
import { AuthResponse, User, Provider } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

const SUPABASE_NOT_CONFIGURED_ERROR = 'Supabase not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env';

// Complete web auth session when user returns to app
WebBrowser.maybeCompleteAuthSession();

// YouVersion OAuth Configuration
const YOUVERSION_CLIENT_ID = process.env.EXPO_PUBLIC_YOUVERSION_CLIENT_ID || '';
const YOUVERSION_CLIENT_SECRET = process.env.EXPO_PUBLIC_YOUVERSION_CLIENT_SECRET || '';
const YOUVERSION_AUTH_URL = 'https://api.youversion.com/oauth/authorize';
const YOUVERSION_TOKEN_URL = 'https://api.youversion.com/oauth/token';

export class AuthService {
  /**
   * sign in with OAuth provider (Google or Apple)
   */
  static async signInWithOAuth(provider: 'google' | 'apple'): Promise<AuthResponse> {
    if (!supabase) throw new Error(SUPABASE_NOT_CONFIGURED_ERROR);

    const redirectTo = AuthSession.makeRedirectUri({
      scheme: 'rooted-daily',
      path: 'auth/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;

    // Open the OAuth URL in browser
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type === 'success') {
        // Parse the URL to get the session
        const url = result.url;
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) throw sessionError;
          return { data: sessionData, error: null };
        }
      }
    }

    return { data: { user: null, session: null }, error: new Error('OAuth cancelled or failed') };
  }

  /**
   * sign in with YouVersion OAuth
   */
  static async signInWithYouVersion(): Promise<AuthResponse> {
    if (!supabase) throw new Error(SUPABASE_NOT_CONFIGURED_ERROR);

    if (!YOUVERSION_CLIENT_ID) {
      throw new Error('YouVersion OAuth not configured. Add EXPO_PUBLIC_YOUVERSION_CLIENT_ID to .env');
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'rooted-daily',
      path: 'auth/callback',
    });

    // Generate PKCE challenge
    const codeVerifier = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString(36)
    );

    const codeChallenge = codeVerifier;

    // Build OAuth URL
    const authUrl = `${YOUVERSION_AUTH_URL}?${new URLSearchParams({
      client_id: YOUVERSION_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user:read',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    }).toString()}`;

    // Open OAuth browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
      const url = result.url;
      const params = new URLSearchParams(url.split('?')[1]);
      const code = params.get('code');

      if (code) {
        // Exchange code for token
        const tokenResponse = await fetch(YOUVERSION_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: YOUVERSION_CLIENT_ID,
            client_secret: YOUVERSION_CLIENT_SECRET,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier,
          }).toString(),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.access_token) {
          // Get user info from YouVersion
          const userResponse = await fetch('https://api.youversion.com/v1/user', {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          });

          const userData = await userResponse.json();

          // Create or sign in user in Supabase with YouVersion data
          const email = userData.email || `${userData.id}@youversion.app`;

          // Sign up/in with a special YouVersion identifier
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: `youversion_${userData.id}_${YOUVERSION_CLIENT_ID}`,
          });

          if (authError && authError.message.includes('Invalid login credentials')) {
            // User doesn't exist, create them
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password: `youversion_${userData.id}_${YOUVERSION_CLIENT_ID}`,
              options: {
                data: {
                  youversion_id: userData.id,
                  youversion_access_token: tokenData.access_token,
                  provider: 'youversion',
                  full_name: userData.name,
                },
              },
            });

            if (signUpError) throw signUpError;
            return { data: signUpData, error: null };
          }

          if (authError) throw authError;

          // Update user metadata with YouVersion token
          await this.updateUserMetadata({
            youversion_access_token: tokenData.access_token,
            youversion_id: userData.id,
          });

          return { data: authData, error: null };
        }
      }
    }

    return { data: { user: null, session: null }, error: new Error('YouVersion OAuth cancelled or failed') };
  }

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
