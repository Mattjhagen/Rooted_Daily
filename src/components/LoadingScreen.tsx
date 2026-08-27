import { View, Text, StyleSheet, ActivityIndicator, Image, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface LoadingScreenProps {
  progress: number;
  message: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message }) => {
  const isDark = useColorScheme() === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <Image 
          source={isDark ? require('../../assets/images/icon.png') : require('../../assets/images/icon-light.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: themeColors.accent }]}>Rooted</Text>
        <Text style={[styles.message, { color: themeColors.textSecondary }]}>{message}</Text>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        
        <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.headingLG,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  progressContainer: {
    width: '80%',
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  percentage: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
});
