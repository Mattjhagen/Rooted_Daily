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

import { PlanCard } from '../../src/components/PlanCard';
import { usePlansStore } from '../../src/features/plans/plansStore';
import { getCanonicalPlan, getMixedOTNTPlan } from '../../src/data/readingPlanData';
const rawBibleData = require('../../src/data/bibleFull.json');
const getBooks = (data: any) => {
  if (Array.isArray(data)) return data;
  if (data.books && Array.isArray(data.books)) return data.books;
  if (data.default) return getBooks(data.default);
  return [];
};
const bibleData = getBooks(rawBibleData);

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const { startPlan, toggleChapter, isChapterCompleted, activePlans } = usePlansStore();
  const [dailyData, setDailyData] = useState(getDailyVerse());
  const [verseText, setVerseText] = useState('Loading...');
  const [streak, setStreak] = useState(5);

  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate plans
  const canonicalSchedule = getCanonicalPlan(bibleData);
  const todaysCanonical = canonicalSchedule[dayOfYear % 365] || canonicalSchedule[0];

  const otntSchedule = getMixedOTNTPlan(bibleData);
  const todaysOTNT = otntSchedule[dayOfYear % 365] || otntSchedule[0];

  useEffect(() => {
    // Start defaults if none
    startPlan('canonical_365');
    startPlan('otnt_365');
  }, []);

  useEffect(() => {
    async function loadVerse() {
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

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.date, { color: themeColors.textSecondary }]}>{todayStr}</Text>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: themeColors.text }]}>Rooted</Text>
            <View style={[styles.streakBadge, { backgroundColor: themeColors.goldLight }]}>
              <Flame size={14} color={themeColors.gold} fill={themeColors.gold} />
              <Text style={[styles.streakText, { color: themeColors.gold }]}>{streak}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Daily Verse</Text>
        </View>
        <VerseCard
          reference={dailyData.ref}
          text={verseText}
          reflectionPreview={dailyData.reflection}
          onPress={handleReflect}
        />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Bible in a Year</Text>
        </View>
        
        <PlanCard
          title="Canonical Journey"
          subtitle={`Today: ${todaysCanonical?.readings?.[0]?.display || 'Loading...'}`}
          progress={(activePlans.find(p => p.planId === 'canonical_365')?.completedChapters.length || 0) / 1189}
          isCompleted={todaysCanonical?.readings?.[0]?.chapters.every(ch => isChapterCompleted('canonical_365', ch)) || false}
          themeColors={themeColors}
          onPress={() => todaysCanonical?.readings?.[0] && router.push(`/verse/${encodeURIComponent(todaysCanonical.readings[0].chapters[0])}`)}
          onCheck={() => todaysCanonical?.readings?.[0]?.chapters.forEach(ch => toggleChapter('canonical_365', ch))}
        />

        <PlanCard
          title="Old & New Testament"
          subtitle={`Today: ${todaysOTNT?.readings?.map(r => r.display).join(' & ') || 'Loading...'}`}
          progress={(activePlans.find(p => p.planId === 'otnt_365')?.completedChapters.length || 0) / 1189}
          isCompleted={todaysOTNT?.readings?.every(r => r.chapters.every(ch => isChapterCompleted('otnt_365', ch))) || false}
          themeColors={themeColors}
          onPress={() => todaysOTNT?.readings?.[0] && router.push(`/verse/${encodeURIComponent(todaysOTNT.readings[0].chapters[0])}`)}
          onCheck={() => todaysOTNT?.readings?.forEach(r => r.chapters.forEach(ch => toggleChapter('otnt_365', ch)))}
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
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
});
