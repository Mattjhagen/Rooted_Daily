// src/components/DevotionalCard.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  useColorScheme 
} from 'react-native';
import { Devotional } from '../features/devotionals/types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { OrgBadge } from './OrgBadge';

interface DevotionalCardProps {
  devotional: Devotional;
  onPress?: () => void;
  fullBody?: boolean;
}

export const DevotionalCard: React.FC<DevotionalCardProps> = ({ 
  devotional, 
  onPress,
  fullBody = false
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const dateStr = new Date(devotional.approvedAt || devotional.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.orgInfo}>
          <Text style={[styles.orgName, { color: themeColors.textSecondary }]}>
            {devotional.organization?.name || 'Rooted Guest'}
          </Text>
          <OrgBadge isVerified={devotional.organization?.isVerified || false} />
        </View>
        <Text style={[styles.date, { color: themeColors.textSecondary }]}>{dateStr}</Text>
      </View>

      <Text style={[styles.title, { color: themeColors.text }]}>{devotional.title}</Text>
      
      <View style={styles.authorRow}>
        <Text style={[styles.author, { color: themeColors.accent }]}>
          {devotional.authorName}
          {devotional.authorTitle ? `, ${devotional.authorTitle}` : ''}
        </Text>
      </View>

      <View style={[styles.verseChip, { backgroundColor: themeColors.accentLight }]}>
        <Text style={[styles.verseText, { color: themeColors.accent }]}>{devotional.verseRef}</Text>
      </View>

      <Text 
        style={[styles.body, { color: themeColors.text }]} 
        numberOfLines={fullBody ? undefined : 3}
      >
        {devotional.body}
      </Text>

      {!fullBody && (
        <Text style={[styles.readMore, { color: themeColors.accent }]}>Read more</Text>
      )}

      {devotional.theme && (
        <View style={styles.footer}>
          <View style={[styles.themeTag, { backgroundColor: themeColors.surfaceAlt }]}>
            <Text style={[styles.themeText, { color: themeColors.textSecondary }]}>{devotional.theme}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Android shadow
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  orgInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgName: {
    ...typography.caption,
    fontFamily: 'DMSans_500Medium',
  },
  date: {
    ...typography.caption,
    fontSize: 11,
  },
  title: {
    ...typography.scriptureLG,
    fontFamily: 'Lora_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 4,
  },
  authorRow: {
    marginBottom: spacing.sm,
  },
  author: {
    ...typography.caption,
    fontFamily: 'DMSans_500Medium',
    fontStyle: 'italic',
  },
  verseChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  verseText: {
    ...typography.caption,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },
  body: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  readMore: {
    ...typography.caption,
    fontFamily: 'DMSans_600SemiBold',
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  themeText: {
    ...typography.caption,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
