// app/(tabs)/index.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { VerseCard } from '../../src/components/VerseCard';
import { SuggestedChips } from '../../src/components/SuggestedChips';
import { getDailyVerse } from '../../src/data/dailyVerses';
import { getVerse } from '../../src/features/bible/bibleService';
import { Flame, BookOpen, CheckCircle2, Circle } from 'lucide-react-native';

import { PlanCard } from '../../src/components/PlanCard';
import { usePlansStore } from '../../src/features/plans/plansStore';
import { getCanonicalPlan, getMixedOTNTPlan } from '../../src/data/readingPlanData';
import { usePersistenceStore } from '../../src/features/persistence/persistenceStore';
import { useToast } from '../../src/context/ToastContext';
const rawBibleData = require('../../src/data/bibleFull.json');
const getBooks = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.books && Array.isArray(data.books)) return data.books;
  if (data.default) return getBooks(data.default);
  // Check if it's nested one more level like { default: { books: [] } }
  if (data.default?.books) return data.default.books;
  return [];
};
const bibleData = getBooks(rawBibleData);

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const { startPlan, toggleChapter, isChapterCompleted, activePlans } = usePlansStore();
  const { 
    lastReadRef, 
    updateDevotionalProgress, 
    getDevotionalProgress, 
    streakCount, 
    points, 
    performCheckIn 
  } = usePersistenceStore();
  
  const [dailyData, setDailyData] = useState(getDailyVerse());
  const [verseText, setVerseText] = useState('Loading...');

  const todayKey = new Date().toISOString().split('T')[0];
  const devProgress = getDevotionalProgress(todayKey);

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay) - 1; // 0-indexed for array access
  const safeDay = Math.max(0, dayOfYear % 365);
  
  // Calculate plans
  const canonicalSchedule = getCanonicalPlan(bibleData);
  const todaysCanonical = canonicalSchedule[safeDay] || canonicalSchedule[0];

  const otntSchedule = getMixedOTNTPlan(bibleData);
  const todaysOTNT = otntSchedule[safeDay] || otntSchedule[0];

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

  const { showToast } = useToast();

  // Auto check-in when devotional is done
  useEffect(() => {
    if (devProgress.completed) {
      const result = performCheckIn();
      if (result) {
        showToast({
          message: `Daily Check-in! +${result.pointsEarned} pts. Streak: ${result.newStreak} days!`,
          type: 'success'
        });
      }
    }
  }, [devProgress.completed]);

  const handleReadVerse = () => {
    updateDevotionalProgress(todayKey, { readBible: true });
    router.push(`/verse/${encodeURIComponent(dailyData.ref)}` as any);
  };

  const handleReflect = (query?: string) => {
    updateDevotionalProgress(todayKey, { reflected: true });
    const url = `/chat/${encodeURIComponent(dailyData.ref)}${query ? `?q=${encodeURIComponent(query)}` : ''}`;
    router.push(url as any);
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
            <View style={styles.headerRight}>
              {lastReadRef && (
                <TouchableOpacity 
                  style={[styles.resumeBtn, { backgroundColor: isDark ? colors.dark.accentLight : colors.accentLight }]}
                  onPress={() => router.push(`/reader/${encodeURIComponent(lastReadRef)}`)}
                >
                  <BookOpen size={16} color={themeColors.accent} />
                  <Text style={[styles.resumeText, { color: themeColors.accent }]}>Resume</Text>
                </TouchableOpacity>
              )}
              <View style={[styles.streakBadge, { backgroundColor: themeColors.goldLight }]}>
                <Flame size={14} color={themeColors.gold} fill={themeColors.gold} />
                <Text style={[styles.streakText, { color: themeColors.gold }]}>{streakCount}</Text>
              </View>
              <View style={[styles.pointsBadge, { backgroundColor: themeColors.accentLight }]}>
                <Text style={[styles.pointsText, { color: themeColors.accent }]}>{points} pts</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Daily Devotional</Text>
          <View style={styles.checkpoints}>
            <View style={styles.checkpoint}>
              {devProgress.readBible ? <CheckCircle2 size={16} color={themeColors.accent} /> : <Circle size={16} color={themeColors.border} />}
              <Text style={[styles.checkpointText, { color: devProgress.readBible ? themeColors.text : themeColors.textSecondary }]}>Read</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.checkpoint}>
              {devProgress.reflected ? <CheckCircle2 size={16} color={themeColors.accent} /> : <Circle size={16} color={themeColors.border} />}
              <Text style={[styles.checkpointText, { color: devProgress.reflected ? themeColors.text : themeColors.textSecondary }]}>Reflect</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.checkpoint}>
              {devProgress.completed ? <CheckCircle2 size={16} color={themeColors.accent} /> : <Circle size={16} color={themeColors.border} />}
              <Text style={[styles.checkpointText, { color: devProgress.completed ? themeColors.text : themeColors.textSecondary }]}>Done</Text>
            </View>
          </View>
        </View>

        <VerseCard
          reference={dailyData.ref}
          text={verseText}
          reflectionPreview={dailyData.reflection}
          onPress={handleReadVerse}
          onReaderPress={() => router.push(`/reader/${encodeURIComponent(dailyData.ref)}`)}
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
          onReaderPress={() => todaysCanonical?.readings?.[0] && router.push(`/reader/${encodeURIComponent(todaysCanonical.readings[0].chapters[0])}`)}
          onCheck={() => todaysCanonical?.readings?.[0]?.chapters.forEach(ch => toggleChapter('canonical_365', ch))}
        />

        <PlanCard
          title="Old & New Testament"
          subtitle={`Today: ${todaysOTNT?.readings?.map(r => r.display).join(' & ') || 'Loading...'}`}
          progress={(activePlans.find(p => p.planId === 'otnt_365')?.completedChapters.length || 0) / 1189}
          isCompleted={todaysOTNT?.readings?.every(r => r.chapters.every(ch => isChapterCompleted('otnt_365', ch))) || false}
          themeColors={themeColors}
          onPress={() => todaysOTNT?.readings?.[0] && router.push(`/verse/${encodeURIComponent(todaysOTNT.readings[0].chapters[0])}`)}
          onReaderPress={() => todaysOTNT?.readings?.[0] && router.push(`/reader/${encodeURIComponent(todaysOTNT.readings[0].chapters[0])}`)}
          onCheck={() => todaysOTNT?.readings?.forEach(r => r.chapters.forEach(ch => toggleChapter('otnt_365', ch)))}
        />

        <View style={styles.quickStartSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Deepen your reflection</Text>
          <SuggestedChips
            suggestions={QUICK_START}
            onSelect={(q) => handleReflect(q)}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  pointsText: {
    ...typography.chip,
    fontWeight: '700',
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: 6,
  },
  resumeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  checkpoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  checkpoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkpointText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  divider: {
    width: 20,
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
    opacity: 0.5,
  },
});
