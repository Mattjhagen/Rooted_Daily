// src/components/MiniPlayer.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { Play, Pause, X } from 'lucide-react-native';
import { useAudioStore } from '../features/audio/audioStore';
import { audioService } from '../services/audio/AudioService';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const { width } = Dimensions.get('window');

export const MiniPlayer = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const { currentTrack, playbackState, position, duration } = useAudioStore();

  if (!currentTrack || playbackState === 'idle') return null;

  const progress = duration > 0 ? (position / duration) : 0;
  const isPlaying = playbackState === 'playing';

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => useAudioStore.getState().setFullPlayerVisible(true)}
      style={[styles.container, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}
    >
      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: themeColors.accent }]} />
      </View>

      <View style={styles.content}>
        <View style={styles.trackInfo}>
          <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          {currentTrack.subtitle && (
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {currentTrack.subtitle}
            </Text>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            onPress={() => isPlaying ? audioService.pause() : audioService.resume()}
            style={styles.mainBtn}
          >
            {isPlaying ? (
              <Pause size={24} color={themeColors.accent} fill={themeColors.accent} />
            ) : (
              <Play size={24} color={themeColors.accent} fill={themeColors.accent} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => audioService.stop()} style={styles.closeBtn}>
            <X size={20} color={themeColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above bottom tabs
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressBarBg: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  progressBarFill: {
    height: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  trackInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    ...typography.body,
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mainBtn: {
    padding: spacing.sm,
  },
  closeBtn: {
    padding: spacing.sm,
  },
});
