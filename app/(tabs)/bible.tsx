// app/(tabs)/bible.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Search } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { getChapterCount } from '../../src/features/bible/bibleService';

const BIBLE_BOOKS = [
  // Old Testament
  { testament: 'Old Testament', books: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
    'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ]},
  // New Testament
  { testament: 'New Testament', books: [
    'Matthew', 'Mark', 'Luke', 'John',
    'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
    'Galatians', 'Ephesians', 'Philippians', 'Colossians',
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
    'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ]}
];

export default function BibleScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  const allBooks = [...BIBLE_BOOKS[0].books, ...BIBLE_BOOKS[1].books];

  const filteredBooks = searchQuery
    ? allBooks.filter(book => book.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const handleBookSelect = (book: string) => {
    setSelectedBook(book);
  };

  const handleChapterSelect = (book: string, chapter: number) => {
    router.push(`/reader/${encodeURIComponent(`${book} ${chapter}`)}`);
  };

  const renderChapterGrid = () => {
    if (!selectedBook) return null;

    const chapterCount = getChapterCount(selectedBook);
    const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

    return (
      <View style={styles.chapterContainer}>
        <View style={styles.chapterHeader}>
          <TouchableOpacity
            onPress={() => setSelectedBook(null)}
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: themeColors.accent }]}>← Back to Books</Text>
          </TouchableOpacity>
          <Text style={[styles.selectedBookTitle, { color: themeColors.text }]}>{selectedBook}</Text>
        </View>
        <FlatList
          data={chapters}
          numColumns={5}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chapterButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
              onPress={() => handleChapterSelect(selectedBook, item)}
            >
              <Text style={[styles.chapterText, { color: themeColors.text }]}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chapterGrid}
        />
      </View>
    );
  };

  const renderBookItem = ({ item: book }: { item: string }) => (
    <TouchableOpacity
      style={[styles.bookItem, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
      onPress={() => handleBookSelect(book)}
    >
      <BookOpen size={20} color={themeColors.accent} />
      <Text style={[styles.bookText, { color: themeColors.text }]}>{book}</Text>
      <Text style={[styles.chapterCount, { color: themeColors.textSecondary }]}>
        {getChapterCount(book)} ch
      </Text>
    </TouchableOpacity>
  );

  const renderTestamentSection = ({ item }: { item: typeof BIBLE_BOOKS[0] }) => (
    <View style={styles.testamentSection}>
      <Text style={[styles.testamentTitle, { color: themeColors.textSecondary }]}>
        {item.testament}
      </Text>
      {item.books.map(book => (
        <View key={book}>
          {renderBookItem({ item: book })}
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: themeColors.text }]}>Bible</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {selectedBook ? 'Select a chapter' : 'Browse books & chapters'}
          </Text>
        </View>
      </View>

      {!selectedBook && (
        <View style={[styles.searchContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <Search size={20} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search books..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {selectedBook ? (
        renderChapterGrid()
      ) : filteredBooks ? (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={BIBLE_BOOKS}
          renderItem={renderTestamentSection}
          keyExtractor={(item) => item.testament}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 28,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  testamentSection: {
    marginBottom: spacing.xl,
  },
  testamentTitle: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: 'DMSans_700Bold',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  bookText: {
    flex: 1,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    marginLeft: spacing.md,
  },
  chapterCount: {
    ...typography.caption,
    fontSize: 12,
  },
  chapterContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  chapterHeader: {
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  selectedBookTitle: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 24,
  },
  chapterGrid: {
    paddingBottom: spacing.xxl,
  },
  chapterButton: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
  },
  chapterText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
});
