import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { supabase } from '../../../src/services/supabase';
import { colors } from '../../../src/theme/colors';
import { typography } from '../../../src/theme/typography';
import { spacing } from '../../../src/theme/spacing';
import { Send, ChevronLeft, MoreVertical, ShieldAlert, UserX } from 'lucide-react-native';
import { useToast } from '../../../src/context/ToastContext';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ConversationScreen() {
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
  const [showMenu, setShowMenu] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    fetchMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
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
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: user.id,
          content: messageContent
        });

      if (error) throw error;
      
      // Update conversation last_message
      await supabase
        .from('conversations')
        .update({ 
          last_message: messageContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

    } catch (err: any) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleBlock = async () => {
    if (!user) return;
    try {
      // Find the other user ID in this conversation
      const { data: conv } = await supabase.from('conversations').select('user1_id, user2_id').eq('id', id).single();
      if (!conv) return;
      const targetId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

      await supabase.from('user_moderation').insert({
        actor_id: user.id,
        target_id: targetId,
        type: 'block'
      });
      showToast({ message: 'User blocked', type: 'info' });
      router.back();
    } catch (err) {
      showToast({ message: 'Failed to block user', type: 'error' });
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    if (!user) return;
    try {
      const { data: conv } = await supabase.from('conversations').select('user1_id, user2_id').eq('id', id).single();
      if (!conv) return;
      const targetId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;

      await supabase.from('user_moderation').insert({
        actor_id: user.id,
        target_id: targetId,
        type: 'report',
        reason: 'Community report'
      });
      showToast({ message: 'User reported to moderators', type: 'info' });
    } catch (err) {
      showToast({ message: 'Failed to report user', type: 'error' });
    }
    setShowMenu(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.otherMessageRow]}>
        <View style={[styles.bubble, isMe ? [styles.myBubble, { backgroundColor: themeColors.accent }] : [styles.otherBubble, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]]}>
          <Text style={[styles.messageText, { color: isMe ? 'white' : themeColors.text }]}>
            {item.content}
          </Text>
        </View>
        <Text style={[styles.time, { color: themeColors.textSecondary }]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <Stack.Screen 
        options={{ 
          title: 'Chat',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={themeColors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
              <MoreVertical size={20} color={themeColors.text} />
            </TouchableOpacity>
          )
        }} 
      />

      {showMenu && (
        <View style={[styles.menu, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
            <ShieldAlert size={18} color={colors.danger} />
            <Text style={[styles.menuText, { color: colors.danger }]}>Report User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
            <UserX size={18} color={colors.danger} />
            <Text style={[styles.menuText, { color: colors.danger }]}>Block User</Text>
          </TouchableOpacity>
        </View>
      )}

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
            placeholder="Type a message..."
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
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
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
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
    zIndex: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.xs,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  menuText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  }
});
