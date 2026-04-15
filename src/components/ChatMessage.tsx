// src/components/ChatMessage.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Share2, Check } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { AudioIconButton } from './AudioIconButton';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;
  const [copied, setCopied] = useState(false);

  const isUser = role === 'user';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    await Share.share({
      message: content,
      title: 'Rooted Daily — Scripture Reflection',
    });
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={[
        styles.bubble,
        {
          backgroundColor: isUser ? themeColors.userBubble : themeColors.aiBubble,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: isUser ? 16 : 4,
        }
      ]}>
        {!isUser && (
          <View style={styles.audioAction}>
            <AudioIconButton
              text={content}
              title="Reflection"
              subtitle="Rooted Companion"
              size={18}
              color={themeColors.aiBubbleText}
            />
          </View>
        )}
        <Text style={[
          styles.text,
          { color: isUser ? themeColors.userBubbleText : themeColors.aiBubbleText }
        ]}>
          {content}
        </Text>

        {!isUser && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleCopy} style={styles.actionBtn} activeOpacity={0.7}>
              {copied
                ? <Check size={14} color={themeColors.accent} />
                : <Copy size={14} color={themeColors.aiBubbleText} opacity={0.5} />
              }
              <Text style={[styles.actionLabel, {
                color: copied ? themeColors.accent : themeColors.aiBubbleText,
                opacity: copied ? 1 : 0.5,
              }]}>
                {copied ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={styles.actionBtn} activeOpacity={0.7}>
              <Share2 size={14} color={themeColors.aiBubbleText} opacity={0.5} />
              <Text style={[styles.actionLabel, { color: themeColors.aiBubbleText, opacity: 0.5 }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    flexDirection: 'row',
    width: '100%',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: 16,
  },
  text: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  audioAction: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  actionLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
  },
});
