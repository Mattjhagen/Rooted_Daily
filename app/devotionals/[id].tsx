// app/devotionals/[id].tsx

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Share, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  useColorScheme,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  Share2, 
  Bookmark, 
  MessageSquare, 
  ExternalLink,
  ChevronLeft
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { Devotional } from '../../src/features/devotionals/types';
import { supabase } from '../../src/features/devotionals/devotionalService';
import { OrgBadge } from '../../src/components/OrgBadge';
import { useToast } from '../../src/context/ToastContext';

export default function DevotionalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevotional() {
      try {
        const { data, error } = await supabase
          .from('devotionals')
          .select(`*, organization:organizations(*)`)
          .eq('id', id)
          .single();

        if (error) throw error;
        setDevotional(data as any);
      } catch (err) {
        console.error('Failed to fetch devotional detail:', err);
        showToast({ message: 'Failed to load devotional', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchDevotional();
  }, [id]);

  const handleShare = async () => {
    if (!devotional) return;
    try {
      await Share.share({
        title: devotional.title,
        message: `${devotional.title}\n\n${devotional.body}\n\n— ${devotional.authorName}\n\nShared from Rooted Daily`,
      });
    } catch (err) {
      console.error('Error sharing devotional:', err);
    }
  };

  const handleBookmark = () => {
    // In a real app, this would save to the journal store
    showToast({ message: 'Saved to journal', type: 'success' });
  };

  const handleReflect = () => {
    if (!devotional) return;
    router.push(`/chat/${encodeURIComponent(devotional.verseRef)}` as any);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.accent} />
      </View>
    );
  }

  if (!devotional) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.textSecondary }}>Devotional not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen options={{ 
        title: '',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={themeColors.text} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
              <Share2 size={22} color={themeColors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleBookmark}>
              <Bookmark size={22} color={themeColors.text} />
            </TouchableOpacity>
          </View>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.verseChip, { backgroundColor: themeColors.accentLight }]}>
            <Text style={[styles.verseText, { color: themeColors.accent }]}>{devotional.verseRef}</Text>
          </View>
          <Text style={[styles.title, { color: themeColors.text }]}>{devotional.title}</Text>
          
          <View style={styles.authorSection}>
            <Text style={[styles.author, { color: themeColors.accent }]}>
              {devotional.authorName}
            </Text>
            {devotional.authorTitle && (
              <Text style={[styles.authorTitle, { color: themeColors.textSecondary }]}>
                {devotional.authorTitle}
              </Text>
            )}
          </View>
        </View>

        {devotional.verseText && (
          <View style={[styles.scriptureBox, { backgroundColor: themeColors.surfaceAlt, borderColor: themeColors.border }]}>
            <Text style={[styles.scriptureText, { color: themeColors.text }]}>
              "{devotional.verseText}"
            </Text>
            <Text style={[styles.scriptureRef, { color: themeColors.textSecondary }]}>
              — {devotional.verseRef} (WEB)
            </Text>
          </View>
        )}

        <View style={styles.bodySection}>
          <Text style={[styles.body, { color: themeColors.text }]}>
            {devotional.body}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.reflectBtn, { backgroundColor: themeColors.accent }]}
          onPress={handleReflect}
        >
          <MessageSquare size={20} color={themeColors.white} />
          <Text style={[styles.reflectBtnText, { color: themeColors.white }]}>Reflect on this verse</Text>
        </TouchableOpacity>

        <View style={[styles.orgCard, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.orgHeader}>
            <Text style={[styles.fromText, { color: themeColors.textSecondary }]}>FROM</Text>
            <View style={styles.orgNameRow}>
              <Text style={[styles.orgName, { color: themeColors.text }]}>
                {devotional.organization?.name}
              </Text>
              <OrgBadge isVerified={devotional.organization?.isVerified || false} size={18} />
            </View>
          </View>
          
          {devotional.organization?.description && (
            <Text style={[styles.orgDesc, { color: themeColors.textSecondary }]}>
              {devotional.organization.description}
            </Text>
          )}

          {devotional.organization?.websiteUrl && (
            <TouchableOpacity 
              style={styles.websiteLink}
              onPress={() => Linking.openURL(devotional.organization!.websiteUrl!)}
            >
              <Text style={[styles.websiteText, { color: themeColors.accent }]}>Visit Website</Text>
              <ExternalLink size={14} color={themeColors.accent} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    marginRight: spacing.lg,
    gap: spacing.md,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 80,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  verseChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  verseText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  title: {
    fontFamily: 'Lora_600SemiBold',
    fontSize: 32,
    lineHeight: 40,
    marginBottom: spacing.md,
  },
  authorSection: {
    marginTop: spacing.xs,
  },
  author: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
  },
  authorTitle: {
    ...typography.caption,
    fontSize: 14,
    marginTop: 2,
  },
  scriptureBox: {
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  scriptureText: {
    ...typography.scriptureLG,
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
  },
  scriptureRef: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.md,
    letterSpacing: 1,
  },
  bodySection: {
    marginBottom: spacing.xxl,
  },
  body: {
    ...typography.scriptureLG,
    fontSize: 18,
    lineHeight: 32,
    color: colors.text,
  },
  reflectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    gap: 12,
    marginBottom: spacing.xxl,
  },
  reflectBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
  },
  orgCard: {
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
  },
  orgHeader: {
    marginBottom: spacing.md,
  },
  fromText: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  orgNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgName: {
    ...typography.headingLG,
    fontFamily: 'Lora_600SemiBold',
  },
  orgDesc: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  websiteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  websiteText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
  },
});
