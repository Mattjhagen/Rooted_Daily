// src/components/VerseCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, shadows } from '../theme/spacing';
import { ChevronRight } from 'lucide-react-native';
import { AudioIconButton } from './AudioIconButton';

interface VerseCardProps {
  reference: string;
  text: string;
  reflectionPreview?: string;
  onPress?: () => void;
  onReaderPress?: () => void;
  showReadFull?: boolean;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  reference,
  text,
  reflectionPreview,
  onPress,
  onReaderPress,
  showReadFull = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: themeColors.accentLight }]}>
          <Text style={[styles.badgeText, { color: themeColors.accent }]}>WEB</Text>
        </View>
        <Text style={[styles.reference, { color: themeColors.accent }]}>{reference}</Text>
        <View style={styles.audioButton}>
          <AudioIconButton text={text} title={reference} subtitle="Rooted Scripture" size={20} />
        </View>
      </View>

      <Text style={[styles.scripture, { color: themeColors.text }]} numberOfLines={4}>
        "{text}"
      </Text>

      {reflectionPreview && (
        <Text style={[styles.reflection, { color: themeColors.textSecondary }]}>
          {reflectionPreview}
        </Text>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={onPress}>
          <Text style={[styles.ctaText, { color: themeColors.accent }]}>Reflect on this verse</Text>
          <ChevronRight size={16} color={themeColors.accent} />
        </TouchableOpacity>

        {showReadFull && (
          <TouchableOpacity style={styles.secondaryCta} onPress={onReaderPress}>
            <Text style={[styles.secondaryCtaText, { color: themeColors.textSecondary }]}>Read full chapter</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    ...shadows.md,
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  audioButton: {
    marginLeft: 'auto',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  reference: {
    ...typography.headingMD,
  },
  scripture: {
    ...typography.scriptureXL,
    marginBottom: spacing.md,
  },
  reflection: {
    ...typography.scriptureMD,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    marginRight: spacing.xs,
  },
  secondaryCta: {},
  secondaryCtaText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
  },
});
