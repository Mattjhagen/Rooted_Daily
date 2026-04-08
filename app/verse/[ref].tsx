// app/verse/[ref].tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { getVerse, getChapter, Verse } from '../../src/features/bible/bibleService';
import { MessageCircle, Share2, Bookmark, ChevronLeft } from 'lucide-react-native';

export default function VerseDetailScreen() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const [mainVerse, setMainVerse] = useState<Verse | null>(null);
  const [contextVerses, setContextVerses] = useState<Verse[]>([]);

  useEffect(() => {
    async function loadData() {
      const parts = ref.match(/(.*)\s(\d+):(\d+)/);
      if (parts) {
        const [_, book, chapter, verse] = parts;
        const v = await getVerse(book, parseInt(chapter), parseInt(verse));
        setMainVerse(v);

        // Load surrounding verses for context
        const all = await getChapter(book, parseInt(chapter));
        const idx = all.findIndex(item => item.verse === parseInt(verse));
        if (idx !== -1) {
          const start = Math.max(0, idx - 3);
          const end = Math.min(all.length, idx + 4);
          setContextVerses(all.slice(start, end));
        }
      }
    }
    loadData();
  }, [ref]);

  if (!mainVerse) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>{ref}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.scriptureContainer}>
          <Text style={[styles.translation, { color: themeColors.accent }]}>WORLD ENGLISH BIBLE</Text>
          <Text style={[styles.mainScripture, { color: themeColors.text }]}>
            {mainVerse.text}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: themeColors.accent }]}
            onPress={() => router.push(`/chat/${encodeURIComponent(ref)}`)}
          >
            <MessageCircle size={20} color={themeColors.white} />
            <Text style={[styles.actionText, { color: themeColors.white }]}>Reflect with AI</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={[styles.iconBtn, { borderColor: themeColors.border }]}>
              <Bookmark size={20} color={themeColors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { borderColor: themeColors.border }]}>
              <Share2 size={20} color={themeColors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contextSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>In Context</Text>
          <View style={[styles.contextBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
            {contextVerses.map((v) => (
              <Text key={v.verse} style={[styles.contextVerse, { color: themeColors.text }]}>
                <Text style={[styles.verseNum, { color: themeColors.accent }]}>{v.verse} </Text>
                <Text style={v.verse === mainVerse.verse ? styles.highlightedText : null}>
                  {v.text}
                </Text>
              </Text>
            ))}
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backBtn: {},
  title: {
    ...typography.headingLG,
  },
  scriptureContainer: {
    marginBottom: spacing.xl,
  },
  translation: {
    ...typography.caption,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  mainScripture: {
    ...typography.scriptureXL,
    lineHeight: 38,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 30,
    flex: 1,
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  contextSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  contextBox: {
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  contextVerse: {
    ...typography.body,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  verseNum: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },
  highlightedText: {
    fontFamily: 'DMSans_500Medium',
  },
});
