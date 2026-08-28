import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../src/services/auth/AuthService';
import { colors } from '../../src/theme/colors';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle OAuth callback - session is already set by AuthService
    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
      } catch (error) {
        router.replace('/auth/login');
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
