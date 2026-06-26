import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '../../../src/services/supabase';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { Send, ChevronLeft, MoreVertical, Users, Info, UserCircle } from 'lucide-react-native';
import { useToast } from '../../../src/context/ToastContext';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export default function ChannelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const { showToast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const flatListRef = useRef<FlatList>(null);

  // Map channel IDs to names for UI
  const channelNames: Record<string, string> = {
    'prayer': 'Prayer Wall',
    'worship': 'Worship & Praise',
    'off-topic': 'Fellowship',
    'qa': 'Q&A'
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`room:${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'channel_messages',
        filter: `channel_id=eq.${id}`
      }, (payload) => {
        // In a real app, we'd fetch the profile for the new message
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchMessages = async () => {
    try {
      // Joining with profiles to get sender names
      const { data, error } = await supabase
        .from('channel_messages')
        .select(`
          *,
          profiles:sender_id (display_name, username, avatar_url)
        `)
        .eq('channel_id', id)
        .order('created_at', { ascending: true });

      if (error) {
        // If the table doesn't exist yet, we'll just show an empty list
        if (error.code === '42P01') {
          setMessages([]);
          return;
        }
        throw error;
      }

      const formatted = data.map((m: any) => ({
        ...m,
        sender_name: m.profiles?.display_name || m.profiles?.username || 'User',
        sender_avatar: m.profiles?.avatar_url
      }));
      setMessages(formatted || []);
    } catch (err: any) {
      console.error(err);
      // Silently fail if table missing, common in early dev
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!content.trim() || sending || !user) return;

    setSending(true);
    const messageContent = content.trim();
    setContent('');

    try {
      const { error } = await supabase
        .from('channel_messages')
        .insert({
          channel_id: id,
          sender_id: user.id,
          content: messageContent
        });

      if (error) throw error;
    } catch (err: any) {
      showToast({ message: 'Failed to send message', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        {!isMe && (
          <View style={styles.avatarContainer}>
            {item.sender_avatar ? (
              <Image source={{ uri: item.sender_avatar }} style={styles.chatAvatar} />
            ) : (
              <View style={[styles.chatAvatarPlaceholder, { backgroundColor: themeColors.accent + '20' }]}>
                <UserCircle size={12} color={themeColors.accent} />
              </View>
            )}
          </View>
        )}
        <View style={isMe ? styles.myBubbleContent : styles.otherBubbleContent}>
          {!isMe && (
            <Text style={[styles.senderName, { color: themeColors.textSecondary }]}>
              {item.sender_name}
            </Text>
          )}
          <View style={[styles.bubble, isMe ? [styles.myBubble, { backgroundColor: themeColors.accent }] : [styles.otherBubble, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]]}>
            <Text style={[styles.messageText, { color: isMe ? 'white' : themeColors.text }]}>
              {item.content}
            </Text>
          </View>
          <Text style={[styles.time, { color: themeColors.textSecondary, textAlign: isMe ? 'right' : 'left' }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen 
        options={{ 
          title: `#${channelNames[id] || id}`,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={themeColors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => {}}>
              <Info size={20} color={themeColors.text} />
            </TouchableOpacity>
          )
        }} 
      />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={themeColors.accent} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
          <TextInput
            style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.background, borderColor: themeColors.border }]}
            placeholder={`Message #${id}...`}
            placeholderTextColor={themeColors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: themeColors.accent, opacity: content.trim() ? 1 : 0.5 }]} 
            onPress={handleSend}
            disabled={!content.trim() || sending}
          >
            {sending ? <ActivityIndicator size="small" color="white" /> : <Send size={20} color="white" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  chatAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myBubbleContent: {
    alignItems: 'flex-end',
    flex: 1,
  },
  otherBubbleContent: {
    alignItems: 'flex-start',
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 4,
    marginLeft: 8,
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
  },
  myBubble: {
    borderBottomRightRadius: 4,
    borderColor: 'transparent',
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 20,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.6,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
