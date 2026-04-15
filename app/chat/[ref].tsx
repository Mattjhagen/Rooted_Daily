// app/chat/[ref].tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing } from '../../src/theme/spacing';
import { ChatMessage as ChatMessageComponent } from '../../src/components/ChatMessage';
import { SuggestedChips } from '../../src/components/SuggestedChips';
import { sendChatMessage, ChatMessage } from '../../src/features/chat/chatService';
import { getVerse, getChapter } from '../../src/features/bible/bibleService';
import { useJournalStore } from '../../src/features/journal/journalStore';
import { Send, ChevronDown, ChevronUp, Save, BookOpen } from 'lucide-react-native';
import { TypingIndicator } from '../../src/components/TypingIndicator';
import { useToast } from '../../src/context/ToastContext';

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
  const { showToast } = useToast();

  useEffect(() => {
    async function initChat() {
      let displayRef = verseRef;
      let contextText = '';

      // Check if verseRef is a single reference or a text block
      const parts = verseRef.match(/(.*)\s(\d+):(\d+)/);
      const chapterParts = verseRef.match(/(.*)\s(\d+)$/);
      
      // If it matches exactly a single verse
      if (parts && verseRef.split('\n').length === 1 && !verseRef.includes(': ')) {
        const [_, book, chapter, verse] = parts;
        const v = await getVerse(book, parseInt(chapter), parseInt(verse));
        if (v) contextText = v.text;
      } else if (chapterParts && verseRef.split('\n').length === 1) {
        // It's a chapter reference (e.g. "Genesis 1")
        const [_, book, chapter] = chapterParts;
        const v = await getChapter(book, parseInt(chapter));
        if (v && v.length > 0) {
          contextText = v.map(item => `${item.verse}: ${item.text}`).join('\n');
        }
      } else if (verseRef.includes(': ')) {
        // It's likely a block of verses passed from the reader
        // e.g. "John 3:16: For God so loved...\nJohn 3:17: ..."
        contextText = verseRef;
        
        // Try to extract a nice title
        const firstLine = verseRef.split('\n')[0];
        const titleMatch = firstLine.match(/(.*)\s(\d+):(\d+)/);
        if (titleMatch) {
          const lastLine = verseRef.trim().split('\n').pop() || '';
          const lastMatch = lastLine.match(/:(\d+)/);
          displayRef = lastMatch 
            ? `${titleMatch[1]} ${titleMatch[2]}:${titleMatch[3]}-${lastMatch[1]}`
            : titleMatch[0];
        } else {
          displayRef = "Selected Verses";
        }
      }

      setVerseText(contextText);

      // Initial query if provided
      if (initialQuery) {
        handleSend(initialQuery);
      } else {
        // Welcome message
        setMessages([
          { 
            role: 'assistant', 
            content: `Hello! I'm here to help you reflect on ${displayRef}. What would you like to explore about these verses?` 
          }
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
    } catch (error: any) {
      console.error(error);
      const displayError = error.message || "I'm sorry, I encountered an error. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: displayError }]);
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
      showToast({ message: 'Saved to Journal', type: 'success' });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
      >
        <View style={[styles.verseHeader, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
          <View style={styles.verseHeaderRow}>
            <TouchableOpacity 
              style={styles.verseHeaderToggle} 
              onPress={() => setIsVerseExpanded(!isVerseExpanded)}
            >
              <Text style={[styles.verseRef, { color: themeColors.accent }]}>{verseRef}</Text>
              {isVerseExpanded ? <ChevronUp size={20} color={themeColors.textSecondary} /> : <ChevronDown size={20} color={themeColors.textSecondary} />}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push(`/reader/${encodeURIComponent(verseRef)}`)}
              style={styles.readerBtn}
            >
              <BookOpen size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
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
          <TypingIndicator />
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
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input, 
                { 
                  color: themeColors.text, 
                  backgroundColor: isDark ? '#2A2622' : themeColors.background,
                  borderColor: isDark ? '#3D3832' : themeColors.border,
                  borderWidth: isDark ? 1 : 0
                }
              ]}
              placeholder="Ask anything..."
              placeholderTextColor={themeColors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              scrollEnabled={true}
              blurOnSubmit={false}
            />
          </View>
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
  verseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseHeaderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  readerBtn: {
    padding: spacing.xs,
    marginLeft: spacing.md,
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
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    maxHeight: 120,
    minHeight: 40,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
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
