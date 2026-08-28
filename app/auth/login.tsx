import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, useColorScheme, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { AuthService } from '../../src/services/auth/AuthService';
import { useToast } from '../../src/context/ToastContext';
import { Mail, Lock, ChevronLeft, Eye, EyeOff, Chrome, BookOpen } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      showToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await AuthService.signUp(email, password);
        if (error) throw error;
        showToast({ message: 'Success! Please check your email.', type: 'success' });
      } else {
        const { error } = await AuthService.signIn(email, password);
        if (error) throw error;
        showToast({ message: 'Welcome back!', type: 'success' });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const { data, error } = await AuthService.signInWithOAuth(provider);
      if (error) throw error;

      if (data.session) {
        showToast({ message: `Welcome! Signed in with ${provider}`, type: 'success' });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      showToast({ message: err.message || 'OAuth sign-in failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleYouVersionSignIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await AuthService.signInWithYouVersion();
      if (error) throw error;

      if (data.session) {
        showToast({ message: 'Welcome! Signed in with YouVersion', type: 'success' });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      showToast({ message: err.message || 'YouVersion sign-in failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      showToast({ message: 'Please enter your email address first', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(email);
      showToast({ message: 'Password reset email sent!', type: 'success' });
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={themeColors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
              {isSignUp ? 'Join the community and sync your journal.' : 'Sign in to sync your reflections across devices.'}
            </Text>
          </View>

          <View style={styles.form}>
            {/* OAuth Buttons */}
            <View style={styles.oauthContainer}>
              <TouchableOpacity
                style={[styles.oauthBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
                onPress={() => handleOAuthSignIn('google')}
                disabled={loading}
              >
                <Chrome size={20} color={themeColors.text} />
                <Text style={[styles.oauthBtnText, { color: themeColors.text }]}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.oauthBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
                onPress={() => handleOAuthSignIn('apple')}
                disabled={loading}
              >
                <Text style={styles.appleIcon}></Text>
                <Text style={[styles.oauthBtnText, { color: themeColors.text }]}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.oauthBtn, styles.youversionBtn, { backgroundColor: '#FF6C00', borderColor: '#FF6C00' }]}
                onPress={handleYouVersionSignIn}
                disabled={loading}
              >
                <BookOpen size={20} color="white" />
                <Text style={[styles.oauthBtnText, { color: 'white' }]}>Continue with YouVersion</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
              <Text style={[styles.dividerText, { color: themeColors.textSecondary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: themeColors.border }]} />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <Mail size={20} color={themeColors.textSecondary} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Email Address"
                placeholderTextColor={themeColors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
              <Lock size={20} color={themeColors.textSecondary} />
              <TextInput
                style={[styles.input, { color: themeColors.text }]}
                placeholder="Password"
                placeholderTextColor={themeColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color={themeColors.textSecondary} /> : <Eye size={20} color={themeColors.textSecondary} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.authBtn, { backgroundColor: themeColors.accent }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text style={styles.authBtnText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>

            {!isSignUp && (
              <TouchableOpacity onPress={handleResetPassword} style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: themeColors.accent }]}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.toggleBtn}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={[styles.toggleText, { color: themeColors.textSecondary }]}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <Text style={{ color: themeColors.accent, fontWeight: '700' }}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  backBtn: {
    marginBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.headingLG,
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  authBtn: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  authBtnText: {
    color: 'white',
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  toggleBtn: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  toggleText: {
    ...typography.caption,
    fontSize: 14,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  forgotText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  oauthContainer: {
    gap: spacing.sm,
  },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.sm,
  },
  oauthBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  appleIcon: {
    fontSize: 20,
  },
  youversionBtn: {
    borderWidth: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
});
