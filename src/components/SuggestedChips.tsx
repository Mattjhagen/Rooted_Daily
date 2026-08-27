// src/components/SuggestedChips.tsx

import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
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
        <Pressable
          key={index}
          style={({ pressed, focused }) => [
            styles.chip, 
            { backgroundColor: focused ? themeColors.border : themeColors.chip },
            pressed && { opacity: 0.8 },
            focused && { borderWidth: 2, borderColor: themeColors.accent }
          ]}
          onPress={() => onSelect(s)}
        >
          {({ focused }) => (
            <Text style={[styles.chipText, { color: focused ? themeColors.text : themeColors.chipText }]}>{s}</Text>
          )}
        </Pressable>
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
