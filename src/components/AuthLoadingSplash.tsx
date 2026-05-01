import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, useColorScheme, Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { DAILY_VERSES } from '../data/dailyVerses';
import { Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface AuthLoadingSplashProps {
  isVisible: boolean;
}

export const AuthLoadingSplash: React.FC<AuthLoadingSplashProps> = ({ isVisible }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [progressAnim] = useState(new Animated.Value(0));
  const [randomVerse] = useState(() => {
    const randomIndex = Math.floor(Math.random() * DAILY_VERSES.length);
    return DAILY_VERSES[randomIndex];
  });

  useEffect(() => {
    if (isVisible) {
      // Fade and Scale in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Looping progress bar
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          })
        ])
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay, 
        { 
          backgroundColor: themeColors.background,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Sparkles size={56} color={colors.gold} />
        </Animated.View>

        <View style={styles.verseContainer}>
          <Text style={[styles.verseText, { color: themeColors.text }]}>
            "{randomVerse.reflection}"
          </Text>
          <Text style={[styles.verseRef, { color: themeColors.accent }]}>
            — {randomVerse.ref}
          </Text>
        </View>

        <View style={styles.loaderContainer}>
          <View style={[styles.loaderTrack, { backgroundColor: themeColors.surfaceAlt }]}>
            <Animated.View 
              style={[
                styles.loaderBar, 
                { 
                  backgroundColor: themeColors.accent,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
          <Text style={[styles.loadingLabel, { color: themeColors.textSecondary }]}>
            Preparing your sanctuary...
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  verseContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  verseText: {
    ...typography.scriptureLG,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 32,
    marginBottom: spacing.lg,
  },
  verseRef: {
    ...typography.headingMD,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  loaderContainer: {
    width: '80%',
    alignItems: 'center',
  },
  loaderTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  loaderBar: {
    height: '100%',
  },
  loadingLabel: {
    ...typography.caption,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  }
});
