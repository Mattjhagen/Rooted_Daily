// src/components/HighlightPalette.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Bookmark, MessageCircle, Copy, StickyNote, X, Share2 } from 'lucide-react-native';

const HIGHLIGHT_COLORS = [
  { id: 'red', hex: '#FF3B30', light: '#FF3B3033' },
  { id: 'green', hex: '#34C759', light: '#34C75933' },
  { id: 'gold', hex: '#FFCC00', light: '#FFCC0033' },
  { id: 'blue', hex: '#007AFF', light: '#007AFF33' },
];

interface HighlightPaletteProps {
  onSelectColor: (color: string) => void;
  onClear: () => void;
  onAction: (action: 'note' | 'ai' | 'copy' | 'share') => void;
  onClose: () => void;
  verseRefs: string[];
}

export function HighlightPalette({ onSelectColor, onClear, onAction, onClose, verseRefs }: HighlightPaletteProps) {
  const colorScheme = useColorScheme();
  const themeColors = colorScheme === 'dark' ? colors.dark : colors;

  const title = verseRefs.length === 1 
    ? verseRefs[0] 
    : `${verseRefs.length} VERSES SELECTED`;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
      <View style={styles.header}>
        <Text style={[styles.ref, { color: themeColors.textSecondary }]}>{title}</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={styles.colorRow}>
          {HIGHLIGHT_COLORS.map((c) => (
            <TouchableOpacity 
              key={c.id}
              style={[styles.colorCircle, { backgroundColor: c.hex }]}
              onPress={() => onSelectColor(c.hex)}
            />
          ))}
          <TouchableOpacity 
            style={[styles.clearBtn, { borderColor: themeColors.border }]}
            onPress={onClear}
          >
            <View style={[styles.noneSlash, { backgroundColor: themeColors.textSecondary }]} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionItem} onPress={() => onAction('ai')}>
            <View style={[styles.actionIcon, { backgroundColor: themeColors.accent }]}>
              <MessageCircle size={18} color="white" />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => onAction('note')}>
            <View style={[styles.actionIcon, { borderColor: themeColors.border, borderWidth: 1 }]}>
              <StickyNote size={18} color={themeColors.text} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>Note</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => onAction('copy')}>
            <View style={[styles.actionIcon, { borderColor: themeColors.border, borderWidth: 1 }]}>
              <Copy size={18} color={themeColors.text} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => onAction('share')}>
            <View style={[styles.actionIcon, { borderColor: themeColors.border, borderWidth: 1 }]}>
              <Share2 size={18} color={themeColors.text} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above reader bottom nav
    left: spacing.md,
    right: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100, // Ensure it's above tap-outside-layer
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ref: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  clearBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  noneSlash: {
    width: 2,
    height: '120%',
    transform: [{ rotate: '45deg' }],
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
    marginHorizontal: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionItem: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
  },
});
