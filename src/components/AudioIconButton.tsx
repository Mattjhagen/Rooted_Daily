// src/components/AudioIconButton.tsx

import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { useAudioStore } from '../features/audio/audioStore';
import { audioService } from '../services/audio/AudioService';
import { TTSService } from '../services/audio/TTSService';
import { colors } from '../theme/colors';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();
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
      const { preferredVoiceIdentifier } = useAudioStore.getState();
      const trackTitle = title || 'Scripture Reading';
      const trackSubtitle = preferredVoiceIdentifier ? 'Read by You (AI)' : (subtitle || 'Rooted Daily');
      
      useAudioStore.getState().setPlaybackState('loading');
      useAudioStore.getState().setTrack({ id: trackTitle, title: trackTitle, subtitle: trackSubtitle, text });
      
      showToast({ message: 'Preparing audio...', type: 'info' });
      
      // If personal voice is selected, we bypass expensive AI narration to use the device's voice
      let audioUrl: string | null = null;
      if (preferredVoiceIdentifier) {
        audioUrl = `speech://${TTSService.cleanText(text)}`;
      } else {
        audioUrl = await TTSService.getAudio(text);
      }
      
      if (!audioUrl) {
        useAudioStore.getState().setPlaybackState('error');
        showToast({ message: 'Could not generate audio. Please try again.', type: 'error' });
        return;
      }

      if (audioUrl.startsWith('speech://')) {
        showToast({ message: 'Using device speech...', type: 'info' });
      } else {
        showToast({ message: 'Streaming high-quality narration...', type: 'success' });
      }
      
      await audioService.play(audioUrl, trackTitle, trackSubtitle);
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
