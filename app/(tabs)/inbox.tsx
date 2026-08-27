import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { MessageSquare, ChevronRight, UserCircle, UserPlus, Users } from 'lucide-react-native';
import { useToast } from '../../src/context/ToastContext';

interface Conversation {
  id: string;
  updated_at: string;
  last_message: string;
  user1_id: string;
  user2_id: string;
}

export default function InboxScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dms' | 'channels'>('dms');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Default system channels
  const systemChannels = [
    { id: 'prayer', name: 'Prayer Wall', description: 'Share and pray for requests', icon: '🙏' },
    { id: 'worship', name: 'Worship & Praise', description: 'Glorifying God together', icon: '🙌' },
    { id: 'off-topic', name: 'Fellowship (Off-topic)', description: 'General community chat', icon: '☕' },
    { id: 'qa', name: 'Q&A / Theology', description: 'Discussing the Word', icon: '📖' },
  ];

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchConversations(data.user.id);
      else setLoading(false);
    });
  }, []);

  const fetchConversations = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    return (
      <TouchableOpacity 
        style={[styles.item, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
        onPress={() => router.push(`/chat/dm/${item.id}`)}
      >
        <UserCircle size={40} color={themeColors.accent} />
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: themeColors.text }]}>
            Conversation
          </Text>
          <Text style={[styles.itemLastMsg, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {item.last_message || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.itemMeta}>
          <Text style={[styles.itemDate, { color: themeColors.textSecondary }]}>
            {new Date(item.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </Text>
          <ChevronRight size={16} color={themeColors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderChannel = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
      onPress={() => router.push(`/chat/channel/${item.id}`)}
    >
      <View style={[styles.channelIcon, { backgroundColor: themeColors.accent + '20' }]}>
        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: themeColors.text }]}>
          #{item.name}
        </Text>
        <Text style={[styles.itemLastMsg, { color: themeColors.textSecondary }]} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <ChevronRight size={16} color={themeColors.textSecondary} />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <MessageSquare size={64} color={themeColors.border} style={{ marginBottom: spacing.lg }} />
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Please sign in to view your messages</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen 
        options={{ 
          title: 'Community',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/chat/discovery')}>
              <View style={[styles.discoverBtn, { backgroundColor: themeColors.accent }]}>
                <UserPlus size={16} color="white" />
                <Text style={styles.discoverBtnText}>Find</Text>
              </View>
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Community</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'dms' && { borderBottomColor: themeColors.accent, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('dms')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'dms' ? themeColors.text : themeColors.textSecondary }]}>Direct Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'channels' && { borderBottomColor: themeColors.accent, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('channels')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'channels' ? themeColors.text : themeColors.textSecondary }]}>Public Channels</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={themeColors.accent} />
      ) : (
        <FlatList
          data={(activeTab === 'dms' ? conversations : systemChannels) as any[]}
          renderItem={activeTab === 'dms' ? renderItem : renderChannel}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => activeTab === 'channels' ? (
            <TouchableOpacity 
              style={[styles.createGroupHeader, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
              onPress={() => router.push('/chat/create-group')}
            >
              <View style={[styles.createIcon, { backgroundColor: themeColors.accent }]}>
                <Users size={20} color="white" />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[styles.itemTitle, { color: themeColors.text }]}>Start a New Group</Text>
                <Text style={[styles.itemLastMsg, { color: themeColors.textSecondary }]}>Private or public fellowship</Text>
              </View>
              <ChevronRight size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          ) : null}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MessageSquare size={64} color={themeColors.border} style={{ marginBottom: spacing.lg }} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                {activeTab === 'dms' ? 'No conversations yet' : 'No channels available'}
              </Text>
            </View>
          )}
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
    padding: spacing.lg,
  },
  title: {
    ...typography.headingLG,
    fontSize: 24,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tabText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
  },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginRight: spacing.md,
  },
  discoverBtnText: {
    color: 'white',
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  itemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  itemTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  itemLastMsg: {
    ...typography.caption,
    fontSize: 13,
  },
  itemMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  }
});
