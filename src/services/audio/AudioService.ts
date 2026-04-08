// src/services/audio/AudioService.ts

import { Audio } from 'expo-av';
import { useAudioStore } from '../../features/audio/audioStore';

class AudioService {
  private sound: Audio.Sound | null = null;
  private updateInterval: any = null;

  async init() {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: 1, // InterruptionModeIOS.DoNotMix
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: 1, // InterruptionModeAndroid.DoNotMix
      playThroughEarpieceAndroid: false,
    });
  }

  async play(uri: string, title: string, subtitle?: string) {
    try {
      const store = useAudioStore.getState();
      
      // Stop current if playing
      if (this.sound) {
        await this.stop();
      }

      store.setTrack({ id: uri, title, subtitle, url: uri });
      store.setPlaybackState('loading');

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate
      );
      
      this.sound = sound;
      this.startProgressTimer();
      
    } catch (error) {
      console.error('Playback failed', error);
      useAudioStore.getState().setPlaybackState('error');
    }
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
      useAudioStore.getState().setPlaybackState('paused');
    }
  }

  async resume() {
    if (this.sound) {
      await this.sound.playAsync();
      useAudioStore.getState().setPlaybackState('playing');
    }
  }

  async stop() {
    if (this.sound) {
      this.stopProgressTimer();
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
      useAudioStore.getState().setPlaybackState('idle');
    }
  }

  private onPlaybackStatusUpdate = (status: any) => {
    const store = useAudioStore.getState();
    if (status.isLoaded) {
      if (status.didJustFinish) {
        this.stop();
      } else {
        store.setPlaybackState(status.isPlaying ? 'playing' : 'paused');
        store.setProgress(status.positionMillis, status.durationMillis || 0);
      }
    } else if (status.error) {
      console.error(`Playback Error: ${status.error}`);
      store.setPlaybackState('error');
    }
  };

  private startProgressTimer() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(async () => {
      if (this.sound) {
        const status = await this.sound.getStatusAsync();
        if (status.isLoaded) {
          useAudioStore.getState().setProgress(status.positionMillis, status.durationMillis || 0);
        }
      }
    }, 500);
  }

  private stopProgressTimer() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const audioService = new AudioService();
