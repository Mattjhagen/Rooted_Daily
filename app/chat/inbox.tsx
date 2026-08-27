import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { MessageSquare, ChevronRight, UserCircle } from 'lucide-react-native';
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

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchConversations(data.user.id);
      else setLoading(false);
    });
  }, []);

  const fetchConversations = async (userId: string) => {
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
      <Stack.Screen options={{ title: 'Messages' }} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Messages</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={themeColors.accent} />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MessageSquare size={64} color={themeColors.border} style={{ marginBottom: spacing.lg }} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No conversations yet</Text>
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
