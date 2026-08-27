// src/components/FullPlayerModal.tsx

import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme, Switch } from 'react-native';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Info } from 'lucide-react-native';
import { useAudioStore } from '../features/audio/audioStore';
import { audioService } from '../services/audio/AudioService';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export const FullPlayerModal = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? colors.dark : colors;

  const { 
    currentTrack, 
    playbackState, 
    position, 
    duration, 
    isFullPlayerVisible, 
    setFullPlayerVisible,
    isKaraokeEnabled,
    setKaraokeEnabled,
    playbackRate
  } = useAudioStore();

  const isPlaying = playbackState === 'playing';

  // Split text into sentences for Karaoke
  const sentences = useMemo(() => {
    if (!currentTrack?.text) return [];
    return currentTrack.text.split(/(?<=[.!?])\s+/);
  }, [currentTrack?.text]);

  // Determine active sentence index using character-weighted timing
  const activeIndex = useMemo(() => {
    if (!isKaraokeEnabled || duration <= 0 || sentences.length === 0) return -1;
    
    const totalChars = sentences.reduce((acc, s) => acc + s.length, 0);
    const progress = position / duration;
    const targetChar = progress * totalChars;
    
    let processedChars = 0;
    for (let i = 0; i < sentences.length; i++) {
      processedChars += sentences[i].length;
      if (processedChars >= targetChar) {
        return i;
      }
    }
    return sentences.length - 1;
  }, [position, duration, sentences, isKaraokeEnabled]);

  if (!currentTrack) return null;

  return (
    <Modal
      visible={isFullPlayerVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setFullPlayerVisible(false)}
    >
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setFullPlayerVisible(false)} style={styles.closeBtn}>
            <ChevronDown size={28} color={themeColors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={[styles.playingFrom, { color: themeColors.textSecondary }]}>PLAYING FROM</Text>
            <Text style={[styles.mainTitle, { color: themeColors.text }]}>{currentTrack.subtitle || 'Scripture'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.closeBtn}
            onPress={() => {
              const msg = `Source: Rooted Daily Narration\nTrack: ${currentTrack.title}\n\nThis audio is generated to help you focus on the Word. "Focus Sync" highlights the text as it is read.`;
              alert(msg);
            }}
          >
            <Info size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>

        {/* Content - Text Display */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.textArea}>
            {sentences.length > 0 ? (
              sentences.map((sentence, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.scriptureText, 
                    { 
                      color: index === activeIndex ? themeColors.accent : themeColors.text,
                      opacity: index === activeIndex ? 1 : 0.4,
                      backgroundColor: index === activeIndex ? themeColors.accent + '25' : 'transparent',
                      textDecorationLine: index === activeIndex ? 'underline' : 'none',
                    }
                  ]}
                >
                  {sentence}{' '}
                </Text>
              ))
            ) : (
              <Text style={[styles.scriptureText, { color: themeColors.text }]}>
                {currentTrack.text || 'Narration in progress...'}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Controls Section */}
        <View style={[styles.footer, { backgroundColor: themeColors.surface }]}>
          <View style={styles.trackMeta}>
            <Text style={[styles.currentRef, { color: themeColors.text }]}>{currentTrack.title}</Text>
            <View style={styles.karaokeToggle}>
              <Text style={[styles.toggleLabel, { color: themeColors.textSecondary }]}>Focus Sync</Text>
              <Switch 
                value={isKaraokeEnabled} 
                onValueChange={setKaraokeEnabled}
                trackColor={{ false: themeColors.border, true: themeColors.accent }}
              />
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: themeColors.border }]}>
              <View style={[styles.progressBarFill, { width: `${(position / duration) * 100}%`, backgroundColor: themeColors.accent }]} />
            </View>
            <View style={styles.timeLabels}>
              <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>{formatTime(position)}</Text>
              <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Main Controls */}
          <View style={styles.mainControls}>
            <TouchableOpacity 
              onPress={() => {
                const rates = [0.5, 0.8, 0.9, 1, 1.25, 1.5, 2];
                const currentIndex = rates.indexOf(playbackRate);
                const nextIndex = (currentIndex + 1) % rates.length;
                audioService.setPlaybackRate(rates[nextIndex]);
              }}
              style={styles.speedBtn}
            >
              <Text style={[styles.speedText, { color: themeColors.accent }]}>{playbackRate}x</Text>
            </TouchableOpacity>

            <View style={styles.playbackCenter}>
              <TouchableOpacity><SkipBack size={32} color={themeColors.text} fill={themeColors.text} /></TouchableOpacity>
              <TouchableOpacity 
                onPress={() => isPlaying ? audioService.pause() : audioService.resume()}
                style={[styles.playBtn, { backgroundColor: themeColors.text }]}
              >
                {isPlaying ? (
                  <Pause size={36} color={themeColors.background} fill={themeColors.background} />
                ) : (
                  <Play size={36} color={themeColors.background} fill={themeColors.background} />
                )}
              </TouchableOpacity>
              <TouchableOpacity><SkipForward size={32} color={themeColors.text} fill={themeColors.text} /></TouchableOpacity>
            </View>

            <View style={{ width: 44 }} /> {/* Spacer to balance speed button */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const formatTime = (millis: number) => {
  const totalSeconds = millis / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  headerTitle: {
    alignItems: 'center',
  },
  playingFrom: {
    ...typography.caption,
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: 'DMSans_700Bold',
  },
  mainTitle: {
    ...typography.body,
    fontFamily: 'DMSans_700Bold',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 200,
  },
  textArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scriptureText: {
    ...typography.scriptureXL,
    fontSize: 28,
    lineHeight: 42,
    marginBottom: 8,
    borderRadius: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: 60,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  trackMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  currentRef: {
    ...typography.headingMD,
    fontSize: 22,
  },
  karaokeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    ...typography.caption,
    fontSize: 12,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  speedBtn: {
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  speedText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
});
