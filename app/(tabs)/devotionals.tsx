// app/(tabs)/devotionals.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  ActivityIndicator,
  useColorScheme 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Sparkles, Wand2 } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Devotional } from '../../src/features/devotionals/types';
import { getApprovedDevotionals, savePersonalizedDevotional } from '../../src/features/devotionals/devotionalService';
import { DevotionalCard } from '../../src/components/DevotionalCard';
import { InterestsModal } from '../../src/components/InterestsModal';
import { PersonalizedDevotionalService } from '../../src/features/devotionals/PersonalizedDevotionalService';
import { usePersistenceStore } from '../../src/features/persistence/persistenceStore';
import { useToast } from '../../src/context/ToastContext';

const PAGE_SIZE = 10;

export default function DevotionalsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [isInterestsModalVisible, setInterestsModalVisible] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [personalizedDevotional, setPersonalizedDevotional] = useState<Devotional | null>(null);
  const { interests } = usePersistenceStore();

  const handleGenerateAI = async () => {
    try {
      setGeneratingAI(true);
      const devotion = await PersonalizedDevotionalService.generatePersonalizedDevotional(interests);
      
      // Attempt to save to Supabase, but don't block the UI if it fails
      try {
        const themeString = interests.join(', ');
        await savePersonalizedDevotional(devotion, themeString);
      } catch (saveErr) {
        console.warn('Failed to save AI devotional to cloud, but displaying locally:', saveErr);
      }
      
      setPersonalizedDevotional(devotion);
      // Refresh list to show the new one in the main feed if it was saved
      fetchDevotionals(true);
      showToast({ message: 'Your personalized devotional is ready!', type: 'success' });
    } catch (err) {
      console.error('AI Devotion failed:', err);
      showToast({ message: 'Failed to generate devotional. Please try again.', type: 'error' });
    } finally {
      setGeneratingAI(false);
    }
  };

  const fetchDevotionals = useCallback(async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else if (devotionals.length === 0) setLoading(true);

      const offset = isRefreshing ? 0 : devotionals.length;
      const data = await getApprovedDevotionals(PAGE_SIZE, offset);

      if (isRefreshing) {
        setDevotionals(data);
      } else {
        setDevotionals(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to fetch devotionals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [devotionals.length]);

  useEffect(() => {
    fetchDevotionals(true);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading && !refreshing) {
      setLoadingMore(true);
      fetchDevotionals();
    }
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.skeletonCard, { backgroundColor: themeColors.surfaceAlt, borderColor: themeColors.border }]} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
        No devotionals yet. Be the first to submit one.
      </Text>
      <TouchableOpacity 
        style={[styles.submitCta, { backgroundColor: themeColors.accent }]}
        onPress={() => router.push('/devotionals/submit')}
      >
        <Text style={[styles.submitCtaText, { color: themeColors.white }]}>Submit a Devotional</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {personalizedDevotional ? (
        <View style={styles.aiResultSection}>
          <View style={styles.aiTitleRow}>
            <Sparkles size={16} color={themeColors.accent} />
            <Text style={[styles.aiSectionLabel, { color: themeColors.accent }]}>YOUR PERSONAL DEVOTION</Text>
          </View>
          <DevotionalCard 
            devotional={personalizedDevotional}
            onPress={() => router.push(`/devotionals/${personalizedDevotional.id}`)}
          />
          <TouchableOpacity 
            style={styles.regenerateBtn}
            onPress={() => setInterestsModalVisible(true)}
          >
            <Wand2 size={16} color={themeColors.textSecondary} />
            <Text style={[styles.regenerateText, { color: themeColors.textSecondary }]}>Refresh with new interests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.aiCtaCard, { backgroundColor: themeColors.accent }]}
          onPress={() => setInterestsModalVisible(true)}
          disabled={generatingAI}
        >
          {generatingAI ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <View style={styles.aiCtaTextContent}>
                <Text style={styles.aiCtaTitle}>Create Daily AI Devotion</Text>
                <Text style={styles.aiCtaSubtitle}>Deeply personal guidance based on what's on your heart today.</Text>
              </View>
              <View style={styles.aiCtaIcon}>
                <Sparkles size={24} color="#FFF" />
              </View>
            </>
          )}
        </TouchableOpacity>
      )}
      
      <View style={styles.sectionDivider}>
        <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>COMMUNITY DEVOTIONS</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: themeColors.text }]}>Devotionals</Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>From churches & organizations</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/devotionals/submit')}
        >
          <Plus size={20} color={themeColors.accent} />
          <Text style={[styles.headerButtonText, { color: themeColors.accent }]}>Submit</Text>
        </TouchableOpacity>
      </View>

      {loading && devotionals.length === 0 ? (
        renderSkeleton()
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={devotionals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DevotionalCard 
                devotional={item} 
                onPress={() => router.push(`/devotionals/${item.id}`)}
              />
            )}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={() => fetchDevotionals(true)} 
                tintColor={themeColors.accent}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator style={styles.footerLoader} color={themeColors.accent} />
              ) : null
            }
          />
        </View>
      )}

      <InterestsModal 
        isVisible={isInterestsModalVisible}
        onClose={() => setInterestsModalVisible(false)}
        onGenerate={handleGenerateAI}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent', // ghost style requested
    gap: 4,
  },
  headerButtonText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonCard: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: 40,
  },
  submitCta: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  submitCtaText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  footerLoader: {
    marginVertical: spacing.md,
  },
  headerSection: {
    marginBottom: spacing.md,
  },
  aiCtaCard: {
    padding: spacing.xl,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  aiCtaTextContent: {
    flex: 1,
  },
  aiCtaTitle: {
    color: '#FFF',
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    marginBottom: 4,
  },
  aiCtaSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
  aiCtaIcon: {
    marginLeft: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 16,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: 'DMSans_700Bold',
  },
  aiResultSection: {
    marginBottom: spacing.xl,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  aiSectionLabel: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: 'DMSans_700Bold',
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  regenerateText: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
});
