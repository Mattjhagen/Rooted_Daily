// app/(tabs)/explore.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, useColorScheme, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Search, Book } from 'lucide-react-native';
import { searchVerses, getChapterCount } from '../../src/features/bible/bibleService';
import { ChevronRight, ArrowLeft } from 'lucide-react-native';

const BOOKS_OT = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"];
const BOOKS_NT = ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];

export default function ExploreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      const results = await searchVerses(text);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const currentBookChapters = selectedBook ? getChapterCount(selectedBook) : 0;

  const renderBookItem = (name: string) => (
    <TouchableOpacity 
      key={name}
      style={[styles.bookItem, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
      onPress={() => setSelectedBook(name)}
    >
      <Book size={16} color={themeColors.accent} style={styles.bookIcon} />
      <Text style={[styles.bookName, { color: themeColors.text }]} numberOfLines={1}>{name}</Text>
      <ChevronRight size={14} color={themeColors.textSecondary} />
    </TouchableOpacity>
  );

  const renderChapterGrid = () => (
    <View style={styles.chapterSection}>
      <TouchableOpacity 
        style={styles.backLink}
        onPress={() => setSelectedBook(null)}
      >
        <ArrowLeft size={18} color={themeColors.accent} />
        <Text style={[styles.backText, { color: themeColors.accent }]}>Full Bible</Text>
      </TouchableOpacity>
      
      <Text style={[styles.selectedBookTitle, { color: themeColors.text }]}>{selectedBook}</Text>
      
      <View style={styles.chapterGrid}>
        {Array.from({ length: currentBookChapters }).map((_, i) => (
          <TouchableOpacity 
            key={i} 
            style={[styles.chapterSquare, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
            onPress={() => router.push(`/reader/${encodeURIComponent(`${selectedBook} ${i + 1}`)}`)}
          >
            <Text style={[styles.chapterNum, { color: themeColors.text }]}>{i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Explore</Text>
        <View style={[styles.searchContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Search size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search scripture or references..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {searchQuery.length > 2 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.book}-${item.chapter}-${item.verse}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.resultItem, { borderBottomColor: themeColors.border }]}
              onPress={() => router.push(`/reader/${encodeURIComponent(`${item.book} ${item.chapter}`)}`)}
            >
              <Text style={[styles.resultRef, { color: themeColors.accent }]}>{item.book} {item.chapter}:{item.verse}</Text>
              <Text style={[styles.resultText, { color: themeColors.text }]} numberOfLines={2}>{item.text}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : selectedBook ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderChapterGrid()}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>Old Testament</Text>
          <View style={styles.bookGrid}>
            {BOOKS_OT.map(renderBookItem)}
          </View>

          <Text style={[styles.sectionTitle, { color: themeColors.textSecondary, marginTop: spacing.xl }]}>New Testament</Text>
          <View style={styles.bookGrid}>
            {BOOKS_NT.map(renderBookItem)}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 28,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  bookIcon: {
    marginRight: spacing.sm,
  },
  bookName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    flex: 1,
  },
  resultItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  resultRef: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  resultText: {
    ...typography.body,
    fontSize: 14,
  },
  chapterSection: {
    paddingVertical: spacing.md,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backText: {
    ...typography.body,
    fontFamily: 'DMSans_600SemiBold',
    marginLeft: spacing.xs,
  },
  selectedBookTitle: {
    ...typography.headingLG,
    fontSize: 24,
    marginBottom: spacing.lg,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chapterSquare: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNum: {
    ...typography.body,
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
  },
});
