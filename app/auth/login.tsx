import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, useColorScheme, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { AuthService } from '../../src/services/auth/AuthService';
import { useToast } from '../../src/context/ToastContext';
import { Mail, Lock, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';

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
});
