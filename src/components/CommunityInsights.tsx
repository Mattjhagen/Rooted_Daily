import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, useColorScheme, Image } from 'react-native';
import { supabase } from '../services/supabase';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Heart, Send, MessageSquare, UserCircle } from 'lucide-react-native';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'expo-router';

interface Insight {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles?: {
    avatar_url: string | null;
  };
}

interface Props {
  book: string;
  chapter: number;
  verse: number;
}

export const CommunityInsights: React.FC<Props> = ({ book, chapter, verse }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let isActive = true;
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isActive) setUser(session?.user || null);
    });

    loadInsights(isActive);
    
    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [book, chapter, verse]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadInsights = async (isActive = true) => {
    setLoading(true);
    setInsights([]); // Clear old insights while loading
    try {
      const { data, error } = await supabase
        .from('community_insights')
        .select('*, profiles:user_id(avatar_url)')
        .match({ book, chapter, verse, is_approved: true })
        .order('likes_count', { ascending: false });

      if (error) throw error;
      if (isActive) setInsights(data || []);
    } catch (err) {
      console.error('Load insights error:', err);
    } finally {
      if (isActive) setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!user) {
      showToast({ message: 'Please sign in to share insights', type: 'info' });
      return;
    }
    if (!content.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('community_insights')
        .insert({
          user_id: user.id,
          user_name: user.user_metadata?.username || user.user_metadata?.full_name || user.email.split('@')[0],
          book,
          chapter,
          verse,
          content: content.trim()
        });

      if (error) throw error;
      setContent('');
      loadInsights();
      showToast({ message: 'Insight shared!', type: 'success' });
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id: string) => {
    if (!user) {
      showToast({ message: 'Please sign in to like insights', type: 'info' });
      return;
    }
    try {
        await supabase.rpc('increment_likes', { insight_id: id });
        loadInsights();
    } catch (err) {
        console.error('Like error:', err);
    }
  };

  const handleStartConversation = async (targetUserId: string, targetUserName: string) => {
    if (!user) {
      showToast({ message: 'Please sign in to message users', type: 'info' });
      return;
    }
    if (user.id === targetUserId) {
      showToast({ message: "You can't message yourself", type: 'info' });
      return;
    }

    try {
      // Check for existing conversation
      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .single();

      if (existing) {
        router.push(`/chat/dm/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: created, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: targetUserId
        })
        .select()
        .single();

      if (createError) throw createError;
      router.push(`/chat/dm/${created.id}`);
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    }
  };

  if (loading && insights.length === 0) {
    return <ActivityIndicator style={{ margin: 20 }} color={themeColors.accent} />;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: themeColors.textSecondary }]}>💬 Community Insights</Text>
      
      {insights.map((ins) => (
        <View key={ins.id} style={[styles.card, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {ins.profiles?.avatar_url ? (
                <Image source={{ uri: ins.profiles.avatar_url }} style={styles.insightAvatar} />
              ) : (
                <View style={[styles.insightAvatarPlaceholder, { backgroundColor: themeColors.accent + '20' }]}>
                  <UserCircle size={14} color={themeColors.accent} />
                </View>
              )}
              <Text style={[styles.author, { color: themeColors.accent, marginLeft: spacing.xs }]}>{ins.user_name}</Text>
            </View>
            <Text style={[styles.date, { color: themeColors.textSecondary }]}>{new Date(ins.created_at).toLocaleDateString()}</Text>
          </View>
          <Text style={[styles.content, { color: themeColors.text }]}>{ins.content}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => handleLike(ins.id)} style={styles.actionBtn}>
              <Heart size={14} color={themeColors.textSecondary} />
              <Text style={[styles.actionCount, { color: themeColors.textSecondary }]}>{ins.likes_count}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleStartConversation(ins.user_id, ins.user_name)} style={styles.actionBtn}>
              <MessageSquare size={14} color={themeColors.textSecondary} />
              <Text style={[styles.actionCount, { color: themeColors.textSecondary }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {insights.length === 0 && !loading && (
        <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No insights yet. Be the first to share!</Text>
      )}

      {user ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.border, backgroundColor: themeColors.surface }]}
            placeholder="Share your insight..."
            placeholderTextColor={themeColors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: themeColors.accent }]} 
            onPress={handlePost}
            disabled={posting}
          >
            {posting ? <ActivityIndicator size="small" color="white" /> : <Send size={18} color="white" />}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.loginPrompt, { borderColor: themeColors.border }]} 
          onPress={() => router.push('/auth/login')}
        >
          <Text style={[styles.loginText, { color: themeColors.textSecondary }]}>
            <Text style={{ color: themeColors.accent, fontWeight: '700' }}>Sign in</Text> to join the conversation
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  insightAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  insightAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  author: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  date: {
    fontSize: 10,
    opacity: 0.6,
  },
  content: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: spacing.xl,
    ...typography.caption,
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    minHeight: 45,
  },
  sendBtn: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  loginText: {
    ...typography.caption,
  }
});
