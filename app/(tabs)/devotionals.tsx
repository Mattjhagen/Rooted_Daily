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
import { Plus } from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Devotional } from '../../src/features/devotionals/types';
import { getApprovedDevotionals } from '../../src/features/devotionals/devotionalService';
import { DevotionalCard } from '../../src/components/DevotionalCard';

const PAGE_SIZE = 10;

export default function DevotionalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
        <FlatList
          data={devotionals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DevotionalCard 
              devotional={item} 
              onPress={() => router.push(`/devotionals/${item.id}`)}
            />
          )}
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
      )}
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
});
