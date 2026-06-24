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
import { getVerse } from '../../src/features/bible/bibleService';
import { getVerseOfTheDayText } from '../../src/services/youversion/YouVersionManager';
import { useYouVersionStore } from '../../src/features/bible/youVersionStore';
import { BibleVersionSelector } from '../../src/components/BibleVersionSelector';
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

import { TutorialModal } from '../../src/components/TutorialModal';

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
    performCheckIn,
    hasSeenTutorial,
    setHasSeenTutorial
  } = usePersistenceStore();
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVersionSelector, setShowVersionSelector] = useState(false);
  const { selectedVersionId, selectedVersionAbbrev } = useYouVersionStore();

  // Wait for Zustand to rehydrate from AsyncStorage before deciding to show tutorial
  useEffect(() => {
    // Check if already hydrated (synchronous case)
    if (usePersistenceStore.persist.hasHydrated()) {
      setShowTutorial(!usePersistenceStore.getState().hasSeenTutorial);
      return;
    }
    // Wait for async hydration to finish
    const unsub = usePersistenceStore.persist.onFinishHydration((state) => {
      setShowTutorial(!state.hasSeenTutorial);
    });
    return () => unsub();
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
  };
  
  const [dailyData, setDailyData] = useState<any>(null); // Use VOTD
  const [verseText, setVerseText] = useState('Loading...');
  const [verseRef, setVerseRef] = useState('Loading...');

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
      console.log('Fetching VOTD...'); setVerseText('Loading...');
      const votdText = await getVerseOfTheDayText(selectedVersionId);
      if (votdText) {
        setVerseText(votdText.text.replace(/<[^>]+>/g, '').trim()); // Strip basic HTML if any
        setVerseRef(votdText.reference);
        setDailyData({ ref: votdText.reference, reflection: 'Take a moment to reflect on today\'s verse.', usfm: votdText.usfm });
      }
    }
    loadVerse();
  }, [selectedVersionId]);

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
    // Navigate to the reader with the USFM or fallback ref
    const targetRef = verseRef;
    router.push(`/reader/${encodeURIComponent(targetRef)}`);
  };

  const handleReflect = (query?: string) => {
    updateDevotionalProgress(todayKey, { reflected: true });
    const targetRef = verseRef;
    const url = `/chat/${encodeURIComponent(targetRef)}${query ? `?q=${encodeURIComponent(query)}` : ''}`;
    router.push(url as any);
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const [titleTaps, setTitleTaps] = useState(0);

  const handleTitleTap = () => {
    const newTaps = titleTaps + 1;
    if (newTaps === 3) {
      setTitleTaps(0);
      router.push('/admin/devotionals');
    } else {
      setTitleTaps(newTaps);
      // Reset taps after 2 seconds of inactivity
      setTimeout(() => setTitleTaps(0), 2000);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.date, { color: themeColors.textSecondary }]}>{todayStr}</Text>
          <View style={styles.titleRow}>
            <TouchableOpacity activeOpacity={1} onPress={handleTitleTap}>
              <Text style={[styles.title, { color: themeColors.text }]}>Rooted</Text>
            </TouchableOpacity>
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

        <View style={styles.devotionalHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Daily Devotional</Text>
          <View style={styles.checkpoints}>
            <TouchableOpacity 
              style={styles.checkpoint}
              onPress={() => showToast({ 
                message: "Tap the verse card below to read today's Scripture and reflection.", 
                type: 'info' 
              })}
            >
              {devProgress.readBible ? <CheckCircle2 size={16} color={themeColors.accent} /> : <Circle size={16} color={themeColors.border} />}
              <Text style={[styles.checkpointText, { color: devProgress.readBible ? themeColors.text : themeColors.textSecondary }]}>Read</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.checkpoint}
              onPress={() => showToast({ 
                message: "Tap 'Reflect' or one of the topics below to start a chat about the verse.", 
                type: 'info' 
              })}
            >
              {devProgress.reflected ? <CheckCircle2 size={16} color={themeColors.accent} /> : <Circle size={16} color={themeColors.border} />}
              <Text style={[styles.checkpointText, { color: devProgress.reflected ? themeColors.text : themeColors.textSecondary }]}>Reflect</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.checkpoint}
              onPress={() => showToast({ 
                message: devProgress.completed 
                  ? "Great job! You've earned points for today's devotional." 
                  : "Finish Read and Reflect to complete today's task and get your points!", 
                type: 'info' 
              })}
            >
              {devProgress.completed ? <CheckCircle2 size={16} color={themeColors.accent} /> : <Circle size={16} color={themeColors.border} />}
              <Text style={[styles.checkpointText, { color: devProgress.completed ? themeColors.text : themeColors.textSecondary }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        <VerseCard
          reference={verseRef}
          text={verseText}
          reflectionPreview={dailyData?.reflection}
          versionAbbreviation={selectedVersionAbbrev}
          onVersionPress={() => setShowVersionSelector(true)}
          onPress={handleReadVerse}
          onReaderPress={() => router.push(`/reader/${encodeURIComponent(verseRef)}`)}
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
      <TutorialModal 
        isVisible={showTutorial} 
        onClose={handleCloseTutorial} 
      />
      <BibleVersionSelector
        isVisible={showVersionSelector}
        onClose={() => setShowVersionSelector(false)}
      />
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
  devotionalHeader: {
    marginTop: spacing.lg,
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
    paddingLeft: spacing.lg,
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
