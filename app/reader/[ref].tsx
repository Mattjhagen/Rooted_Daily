// app/reader/[ref].tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme, TouchableOpacity, Dimensions, Animated as RNAnimated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { getChapter, getChapterCount, Verse as BibleVerse } from '../../src/features/bible/bibleService';
import { ChevronLeft, ChevronRight, Share2, MessageCircle, Info, Type as TypeIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import { Clipboard, Share, Pressable } from 'react-native';
import { useHighlightsStore } from '../../src/features/bible/highlightsStore';
import { HighlightPalette } from '../../src/components/HighlightPalette';
import { AudioIconButton } from '../../src/components/AudioIconButton';
import { useReaderSettings } from '../../src/features/reader/readerSettingsStore';
import { ReaderSettingsSheet } from '../../src/components/ReaderSettingsSheet';
import { BookmarkButton } from '../../src/components/BookmarkButton';
import { usePersistenceStore } from '../../src/features/persistence/persistenceStore';

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
  
  // Custom Reader Settings
  const { theme, fontSize, fontFamily } = useReaderSettings();
  const { updateLastReadRef } = usePersistenceStore();
  const [showSettings, setShowSettings] = useState(false);

  // Theme resolution helper
  const getReaderColors = () => {
    switch (theme) {
      case 'white': return { bg: '#FFFFFF', text: '#000000', surface: '#F9F9F9', border: '#EEE' };
      case 'black': return { bg: '#000000', text: '#F0EDE8', surface: '#1A1A1A', border: '#333' };
      // Parchment: Deepened text from #1C1917 to #000000 for better contrast on devices
      default: return { bg: '#FAF8F4', text: '#000000', surface: '#FFFFFF', border: '#E8E2D9' };
    }
  };
  const readerColors = getReaderColors();
  const accentColor = colors.accent;

  const { highlights, setHighlight, removeHighlight } = useHighlightsStore();

  const [currentRef, setCurrentRef] = useState(ref);
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [showDemo, setShowDemo] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<string[]>([]);
  
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

  // Persist last read ref
  useEffect(() => {
    updateLastReadRef(currentRef);
  }, [currentRef]);

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
    if (selectedVerses.length === 0) return;
    
    if (action === 'copy') {
      const texts = await getSelectedTexts();
      Clipboard.setString(texts.join('\n'));
      setSelectedVerses([]);
    } else if (action === 'ai') {
      const texts = await getSelectedTexts();
      router.push(`/chat/${encodeURIComponent(texts.join('\n'))}`);
      setSelectedVerses([]);
    } else if (action === 'note') {
      router.push('/journal');
      setSelectedVerses([]);
    } else if (action === 'share') {
      await handleShare(selectedVerses);
      setSelectedVerses([]);
    }
  };

  const getSelectedTexts = async () => {
    const texts: string[] = [];
    for (const ref of selectedVerses) {
      const parts = ref.match(/(.*)\s(\d+):(\d+)/);
      if (parts) {
        const [_, book, chapter, verse] = parts;
        const v = await getChapter(book, parseInt(chapter));
        const verseData = v.find(item => item.verse === parseInt(verse));
        if (verseData) texts.push(`${ref}: ${verseData.text}`);
      }
    }
    return texts;
  };

  const handleShare = async (refs: string[]) => {
    const texts = await getSelectedTexts();
    const shareContent = `${texts.join('\n')}\n\n— World English Bible`;
    try {
      await Share.share({ message: shareContent });
    } catch (err) {
      console.error('Sharing failed', err);
    }
  };

  const isLightMode = theme !== 'black';

  const textStyle = {
    fontFamily: 
      fontFamily === 'serif' ? 'Lora_400Regular' : 
      // Scholarly: Use 600 weight in light mode for better legibility
      fontFamily === 'scholarly' ? (isLightMode ? 'EBGaramond_600SemiBold' : 'EBGaramond_400Regular') :
      // Academic: Use 700 weight in light mode for better legibility
      fontFamily === 'academic' ? (isLightMode ? 'PlayfairDisplay_700Bold' : 'PlayfairDisplay_400Regular') :
      fontFamily === 'sans' ? 'DMSans_400Regular' :
      fontFamily === 'modern' ? 'Inter_400Regular' :
      fontFamily === 'clean' ? 'Montserrat_400Regular' :
      'Lora_400Regular',
    fontSize: fontSize,
    lineHeight: fontSize * 1.6,
  };

  const renderChapter = ({ item }: { item: ChapterData }) => (
    <Pressable 
      style={[styles.chapterPage, { width, backgroundColor: readerColors.bg }]}
      onPress={() => setSelectedVerses([])}
    >
      <FlatList
        data={item.verses}
        keyExtractor={(v) => `${v.chapter}:${v.verse}`}
        renderItem={({ item: v }) => {
          const vRef = `${item.book} ${item.chapter}:${v.verse}`;
          const isSelected = selectedVerses.includes(vRef);
          const highlightColor = highlights[vRef];

          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {
                if (isSelected) {
                  setSelectedVerses(selectedVerses.filter(r => r !== vRef));
                } else {
                  setSelectedVerses([...selectedVerses, vRef]);
                }
              }}
              style={[
                styles.verseRow, 
                highlightColor ? { backgroundColor: highlightColor + '44' } : null,
                isSelected ? { 
                  backgroundColor: colors.accent + '22',
                  borderBottomWidth: 1.5,
                  borderBottomColor: colors.accent,
                  borderStyle: 'dotted'
                } : null
              ]}
            >
              <Text style={[textStyle, { color: readerColors.text }]}>
                <Text style={[styles.verseNum, { color: accentColor, fontSize: fontSize * 0.6 }]}>{v.verse} </Text>
                {v.text}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListHeaderComponent={() => (
          <View style={styles.chapterHeader}>
            <Text style={[styles.chapterTitle, { color: readerColors.text }]}>{item.chapter}</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: readerColors.bg }]}>
      <StatusBar style={theme === 'black' ? 'light' : 'dark'} />
      <View style={[styles.topBar, { backgroundColor: readerColors.bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={readerColors.text} />
        </TouchableOpacity>
        <Text style={[styles.bookTitle, { color: readerColors.text }]}>{activeChapter?.book}</Text>
        <View style={styles.topRightActions}>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
            <TypeIcon size={20} color={readerColors.text} />
          </TouchableOpacity>
          <BookmarkButton reference={currentRef} color={readerColors.text} />
          <AudioIconButton 
            text={activeChapter?.verses.map(v => v.text).join(' ') || ''} 
            title={`${activeChapter?.book} ${activeChapter?.chapter}`}
            subtitle="Read by Rooted"
            size={22}
            color={readerColors.text}
          />
        </View>
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

      {selectedVerses.length > 0 && (
        <HighlightPalette
          verseRefs={selectedVerses}
          onSelectColor={(color) => {
            selectedVerses.forEach(ref => setHighlight(ref, color));
            setSelectedVerses([]);
          }}
          onClear={() => {
            selectedVerses.forEach(ref => removeHighlight(ref));
            setSelectedVerses([]);
          }}
          onAction={handleAction}
          onClose={() => setSelectedVerses([])}
        />
      )}

      <ReaderSettingsSheet 
        visible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {showDemo && (
        <View style={styles.demoOverlay} pointerEvents="none">
          <View style={[styles.demoHint, { backgroundColor: accentColor }]}>
            <Text style={styles.demoText}>Swipe to change chapters</Text>
          </View>
        </View>
      )}

      <View style={[styles.bottomNav, { backgroundColor: readerColors.surface, borderTopColor: readerColors.border }]}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePrev}>
          <ChevronLeft size={24} color={activeIndex > 0 ? readerColors.text : readerColors.text + '44'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.reflectBtn, { backgroundColor: accentColor }]}
          onPress={() => router.push(`/chat/${encodeURIComponent(currentRef)}`)}
        >
          <MessageCircle size={20} color="white" />
          <Text style={styles.reflectText}>Reflect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={handleNext}>
          <ChevronRight size={24} color={activeIndex < chapters.length - 1 ? readerColors.text : readerColors.text + '44'} />
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
    marginLeft: 40, // Offset to keep it centered
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
