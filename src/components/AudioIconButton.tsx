// src/components/AudioIconButton.tsx

import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { useAudioStore } from '../features/audio/audioStore';
import { audioService } from '../services/audio/AudioService';
import { TTSService } from '../services/audio/TTSService';
import { colors } from '../theme/colors';

interface AudioIconButtonProps {
  text: string;
  title: string;
  subtitle?: string;
  size?: number;
  color?: string;
}

export const AudioIconButton: React.FC<AudioIconButtonProps> = ({ 
  text, 
  title, 
  subtitle, 
  size = 24, 
  color 
}) => {
  const { currentTrack, playbackState } = useAudioStore();
  const isActive = currentTrack?.title === title;
  const isLoading = isActive && playbackState === 'loading';
  const isPlaying = isActive && playbackState === 'playing';

  const handlePress = async () => {
    if (isPlaying) {
      await audioService.pause();
    } else if (isActive && playbackState === 'paused') {
      await audioService.resume();
    } else {
      // Start new track
      useAudioStore.getState().setPlaybackState('loading');
      useAudioStore.getState().setTrack({ id: title, title, subtitle });
      
      const audioUrl = await TTSService.getAudio(text);
      if (audioUrl) {
        await audioService.play(audioUrl, title, subtitle);
      } else {
        useAudioStore.getState().setPlaybackState('error');
      }
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button}>
      {isLoading ? (
        <ActivityIndicator size="small" color={color || colors.accent} />
      ) : isPlaying ? (
        <Pause size={size} color={color || colors.accent} fill={color || colors.accent} />
      ) : (
        <Play size={size} color={color || colors.accent} fill={color || colors.accent} opacity={0.8} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
