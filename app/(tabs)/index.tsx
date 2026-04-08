// app/(tabs)/index.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { VerseCard } from '../../src/components/VerseCard';
import { SuggestedChips } from '../../src/components/SuggestedChips';
import { getDailyVerse } from '../../src/data/dailyVerses';
import { getVerse } from '../../src/features/bible/bibleService';
import { Flame } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const [dailyData, setDailyData] = useState(getDailyVerse());
  const [verseText, setVerseText] = useState('Loading...');
  const [streak, setStreak] = useState(5); // Mock streak

  useEffect(() => {
    async function loadVerse() {
      // Parse "John 3:16" to get book, chap, verse
      const parts = dailyData.ref.match(/(.*)\s(\d+):(\d+)/);
      if (parts) {
        const [_, book, chapter, verse] = parts;
        const v = await getVerse(book, parseInt(chapter), parseInt(verse));
        if (v) setVerseText(v.text);
      }
    }
    loadVerse();
  }, [dailyData]);

  const QUICK_START = [
    "What does this mean?",
    "Show me the context",
    "How can I apply this today?",
    "Turn this into a prayer",
  ];

  const handleReflect = () => {
    router.push(`/chat/${encodeURIComponent(dailyData.ref)}`);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.date, { color: themeColors.textSecondary }]}>{today}</Text>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: themeColors.text }]}>Rooted</Text>
            <View style={[styles.streakBadge, { backgroundColor: themeColors.goldLight }]}>
              <Flame size={14} color={themeColors.gold} fill={themeColors.gold} />
              <Text style={[styles.streakText, { color: themeColors.gold }]}>{streak}</Text>
            </View>
          </View>
        </View>

        <VerseCard
          reference={dailyData.ref}
          text={verseText}
          reflectionPreview={dailyData.reflection}
          onPress={handleReflect}
        />

        <View style={styles.quickStartSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Quick Start</Text>
          <SuggestedChips
            suggestions={QUICK_START}
            onSelect={(q) => router.push(`/chat/${encodeURIComponent(dailyData.ref)}?q=${encodeURIComponent(q)}`)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  date: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 28,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  streakText: {
    ...typography.chip,
    marginLeft: 4,
  },
  quickStartSection: {
    marginTop: spacing.xl,
    marginLeft: -spacing.lg, // Align with screen edge
    marginRight: -spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
});
