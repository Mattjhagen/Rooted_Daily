// src/components/SuggestedChips.tsx

import React from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface SuggestedChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export const SuggestedChips: React.FC<SuggestedChipsProps> = ({ suggestions, onSelect }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {suggestions.map((s, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.chip, { backgroundColor: themeColors.chip }]}
          onPress={() => onSelect(s)}
        >
          <Text style={[styles.chipText, { color: themeColors.chipText }]}>{s}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  chipText: {
    ...typography.chip,
  },
});
