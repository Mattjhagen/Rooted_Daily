// app/chat/[ref].tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { ChatMessage as ChatMessageComponent } from '../../src/components/ChatMessage';
import { SuggestedChips } from '../../src/components/SuggestedChips';
import { sendChatMessage, ChatMessage } from '../../src/features/chat/chatService';
import { getVerse } from '../../src/features/bible/bibleService';
import { useJournalStore } from '../../src/features/journal/journalStore';
import { Send, ChevronDown, ChevronUp, Save } from 'lucide-react-native';

export default function ChatScreen() {
  const { ref: verseRef, q: initialQuery } = useLocalSearchParams<{ ref: string, q?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [verseText, setVerseText] = useState('');
  const [isVerseExpanded, setIsVerseExpanded] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const addJournalEntry = useJournalStore(state => state.addEntry);

  useEffect(() => {
    async function initChat() {
      // Load verse text
      const parts = verseRef.match(/(.*)\s(\d+):(\d+)/);
      if (parts) {
        const [_, book, chapter, verse] = parts;
        const v = await getVerse(book, parseInt(chapter), parseInt(verse));
        if (v) setVerseText(v.text);
      }

      // Initial query if provided
      if (initialQuery) {
        handleSend(initialQuery);
      } else {
        // Welcome message
        setMessages([
          { role: 'assistant', content: `Hello! I'm here to help you reflect on ${verseRef}. What would you like to explore about this verse?` }
        ]);
        setSuggestions(["What does this mean?", "Historical context", "How to apply this?"]);
      }
    }
    initChat();
  }, [verseRef, initialQuery]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setSuggestions([]);

    try {
      const response = await sendChatMessage(messages, text, verseRef, verseText);
      const aiMsg: ChatMessage = { role: 'assistant', content: response.text };
      setMessages(prev => [...prev, aiMsg]);
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveToJournal = () => {
    // Save last assistant message or full chat summary? 
    // For MVP, save a note about this verse.
    const lastAiMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAiMsg) {
      addJournalEntry({
        date: new Date().toISOString().split('T')[0],
        verseRef,
        verseText,
        note: lastAiMsg.content,
        type: 'reflection'
      });
      alert('Saved to Journal');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.verseHeader, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
          <TouchableOpacity 
            style={styles.verseHeaderToggle} 
            onPress={() => setIsVerseExpanded(!isVerseExpanded)}
          >
            <Text style={[styles.verseRef, { color: themeColors.accent }]}>{verseRef}</Text>
            {isVerseExpanded ? <ChevronUp size={20} color={themeColors.textSecondary} /> : <ChevronDown size={20} color={themeColors.textSecondary} />}
          </TouchableOpacity>
          {isVerseExpanded && (
            <Text style={[styles.verseText, { color: themeColors.text }]}>"{verseText}"</Text>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => <ChatMessageComponent role={item.role} content={item.content} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isTyping && (
          <Text style={[styles.typing, { color: themeColors.textSecondary }]}>Rooted is thinking...</Text>
        )}

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <SuggestedChips suggestions={suggestions} onSelect={handleSend} />
          </View>
        )}

        <View style={[styles.inputContainer, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
          <TouchableOpacity onPress={saveToJournal} style={styles.actionBtn}>
            <Save size={24} color={themeColors.accent} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.background }]}
            placeholder="Ask anything..."
            placeholderTextColor={themeColors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { backgroundColor: themeColors.accent }]} 
            onPress={() => handleSend(inputText)}
            disabled={!inputText.trim() || isTyping}
          >
            <Send size={20} color={themeColors.white} />
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
  verseHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  verseHeaderToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseRef: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
  },
  verseText: {
    ...typography.scriptureMD,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  listContent: {
    padding: spacing.md,
  },
  typing: {
    paddingHorizontal: spacing.md,
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  suggestionsContainer: {
    paddingBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
  },
  actionBtn: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});
