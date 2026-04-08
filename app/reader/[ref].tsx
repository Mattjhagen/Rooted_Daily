// app/reader/[ref].tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme, TouchableOpacity, SafeAreaView, Dimensions, Animated as RNAnimated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { getChapter, getChapterCount, Verse as BibleVerse } from '../../src/features/bible/bibleService';
import { ChevronLeft, ChevronRight, Share2, MessageCircle, Info } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import { Clipboard, Share, Pressable } from 'react-native';
import { useHighlightsStore } from '../../src/features/bible/highlightsStore';
import { HighlightPalette } from '../../src/components/HighlightPalette';

const { width } = Dimensions.get('window');
const SWIPE_DEMO_KEY = 'has_seen_swipe_demo';

interface ChapterData {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export default function ReaderScreen() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = colorScheme === 'dark' ? colors.dark : colors;

  const { highlights, setHighlight, removeHighlight } = useHighlightsStore();

  const [currentRef, setCurrentRef] = useState(ref);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const swipeAnim = useSharedValue(0);

  useEffect(() => {
    const parts = currentRef.match(/(.*)\s(\d+)/);
    if (parts) {
      const [_, book, chapter] = parts;
      loadChapters(book, parseInt(chapter));
    }
    checkDemo();
  }, []);

  const checkDemo = async () => {
    const seen = await AsyncStorage.getItem(SWIPE_DEMO_KEY);
    if (!seen) {
      setShowDemo(true);
      swipeAnim.value = withDelay(1000, withSequence(
        withTiming(-50, { duration: 400 }),
        withTiming(0, { duration: 400 }),
        withTiming(-50, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ));
      setTimeout(() => {
        setShowDemo(false);
        AsyncStorage.setItem(SWIPE_DEMO_KEY, 'true');
      }, 5000);
    }
  };

  const loadChapters = async (book: string, startChapter: number) => {
    const count = getChapterCount(book);
    const loaded: ChapterData[] = [];
    const start = Math.max(1, startChapter - 2);
    const end = Math.min(count, startChapter + 2);

    for (let i = start; i <= end; i++) {
      const verses = await getChapter(book, i);
      loaded.push({ book, chapter: i, verses });
    }
    setChapters(loaded);
    
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: startChapter - start,
        animated: false
      });
    }, 100);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeAnim.value }]
  }));

  const handleAction = async (action: 'note' | 'ai' | 'copy' | 'share') => {
    if (!selectedVerse) return;
    
    if (action === 'copy') {
      Clipboard.setString(selectedVerse);
      setSelectedVerse(null);
    } else if (action === 'ai') {
      router.push(`/chat/${encodeURIComponent(selectedVerse)}`);
      setSelectedVerse(null);
    } else if (action === 'note') {
      router.push('/journal');
      setSelectedVerse(null);
    } else if (action === 'share') {
      await handleShare(selectedVerse);
      setSelectedVerse(null);
    }
  };

  const handleShare = async (ref: string) => {
    // Find the text for this ref
    let text = '';
    const parts = ref.match(/(.*)\s(\d+):(\d+)/);
    if (parts) {
      const [_, book, chapter, verse] = parts;
      const v = await getChapter(book, parseInt(chapter));
      const verseData = v.find(item => item.verse === parseInt(verse));
      if (verseData) text = verseData.text;
    }

    const shareContent = `"${text}"\n\n— ${ref} (World English Bible)`;
    try {
      await Share.share({ message: shareContent });
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

  const renderChapter = ({ item }: { item: ChapterData }) => (
    <Pressable 
      style={[styles.chapterPage, { width }]}
      onPress={() => setSelectedVerse(null)}
    >
      <FlatList
        data={item.verses}
        keyExtractor={(v) => `${v.chapter}:${v.verse}`}
        renderItem={({ item: v }) => {
          const vRef = `${item.book} ${item.chapter}:${v.verse}`;
          const isSelected = selectedVerse === vRef;
          const highlightColor = highlights[vRef];

          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setSelectedVerse(isSelected ? null : vRef)}
              style={[
                styles.verseRow, 
                highlightColor ? { backgroundColor: highlightColor + '44' } : null,
                isSelected ? { 
                  backgroundColor: themeColors.accent + '22',
                  borderBottomWidth: 1.5,
                  borderBottomColor: themeColors.accent,
                  borderStyle: 'dotted'
                } : null
              ]}
            >
              <Text style={[styles.verseText, { color: themeColors.text }]}>
                <Text style={[styles.verseNum, { color: themeColors.accent }]}>{v.verse} </Text>
                {v.text}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={() => (
          <View style={styles.chapterHeader}>
            <Text style={[styles.chapterTitle, { color: themeColors.text }]}>{item.chapter}</Text>
          </View>
        )}
        contentContainerStyle={styles.versesContent}
        showsVerticalScrollIndicator={false}
      />
    </Pressable>
  );

  const activeChapter = chapters.find(c => `${c.book} ${c.chapter}` === currentRef);

  const activeIndex = chapters.findIndex(c => `${c.book} ${c.chapter}` === currentRef);

  const handlePrev = () => {
    if (activeIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: activeIndex - 1 });
    }
  };

  const handleNext = () => {
    if (activeIndex < chapters.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.bookTitle, { color: themeColors.text }]}>{activeChapter?.book}</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Share2 size={20} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <FlatList
          ref={flatListRef}
          data={chapters}
          renderItem={renderChapter}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => `${item.book}-${item.chapter}`}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            const newChapter = chapters[index];
            if (newChapter) {
              setCurrentRef(`${newChapter.book} ${newChapter.chapter}`);
            }
          }}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </Animated.View>

      {selectedVerse && (
        <HighlightPalette
          verseRef={selectedVerse}
          onSelectColor={(color) => {
            setHighlight(selectedVerse, color);
            setSelectedVerse(null);
          }}
          onClear={() => {
            removeHighlight(selectedVerse);
            setSelectedVerse(null);
          }}
          onAction={handleAction}
          onClose={() => setSelectedVerse(null)}
        />
      )}

      {showDemo && (
        <View style={styles.demoOverlay} pointerEvents="none">
          <View style={[styles.demoHint, { backgroundColor: themeColors.accent }]}>
            <Text style={styles.demoText}>Swipe to change chapters</Text>
          </View>
        </View>
      )}

      <View style={[styles.bottomNav, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePrev}>
          <ChevronLeft size={24} color={activeIndex > 0 ? themeColors.text : themeColors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.reflectBtn, { backgroundColor: themeColors.accent }]}
          onPress={() => router.push(`/chat/${encodeURIComponent(currentRef)}`)}
        >
          <MessageCircle size={20} color={themeColors.white} />
          <Text style={styles.reflectText}>Reflect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
          <ChevronRight size={24} color={activeIndex < chapters.length - 1 ? themeColors.text : themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 56,
  },
  bookTitle: {
    ...typography.headingLG,
    fontSize: 18,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterPage: {
    flex: 1,
  },
  versesContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  chapterHeader: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  chapterTitle: {
    fontFamily: 'Lora_700Bold',
    fontSize: 64,
    opacity: 0.8,
  },
  verseRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginVertical: 1,
  },
  verseText: {
    ...typography.scriptureXL,
    fontSize: 19,
    lineHeight: 32,
  },
  verseNum: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
  },
  navBtn: {
    padding: spacing.sm,
  },
  reflectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    gap: spacing.sm,
  },
  reflectText: {
    color: 'white',
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
  },
  demoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  demoHint: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  demoText: {
    color: 'white',
    fontFamily: 'DMSans_500Medium',
  }
});
