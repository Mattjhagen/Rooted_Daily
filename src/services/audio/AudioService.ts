import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { useAudioStore } from '../../features/audio/audioStore';

class AudioService {
  private sound: Audio.Sound | null = null;
  private updateInterval: any = null;
  private currentSpeechText: string | null = null;

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

      if (uri.startsWith('speech://')) {
        const text = uri.replace('speech://', '');
        await this.playNativeSpeech(text);
        return;
      }

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
    } else {
      if (Platform.OS === 'android') {
        await Speech.stop();
      } else {
        await Speech.pause();
      }
      useAudioStore.getState().setPlaybackState('paused');
    }
  }

  async resume() {
    if (this.sound) {
      await this.sound.playAsync();
      useAudioStore.getState().setPlaybackState('playing');
    } else {
      if (Platform.OS === 'android') {
        if (this.currentSpeechText) {
          await this.playNativeSpeech(this.currentSpeechText);
        }
      } else {
        await Speech.resume();
        useAudioStore.getState().setPlaybackState('playing');
      }
    }
  }

  async stop() {
    if (this.sound) {
      this.stopProgressTimer();
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    } else {
      this.stopProgressTimer();
      await Speech.stop();
    }
    useAudioStore.getState().setPlaybackState('idle');
  }

  private async playNativeSpeech(text: string) {
    this.currentSpeechText = text;
    const store = useAudioStore.getState();
    store.setPlaybackState('playing');
    
    // Estimate duration: ~150 words per minute -> 2.5 words per sec
    const words = text.split(/\s+/).length;
    const estimatedDuration = (words / 2.5) * 1000;
    store.setProgress(0, estimatedDuration);

    this.startSpeechProgressTimer(estimatedDuration);

    Speech.speak(text, {
      onDone: () => { this.stop(); },
      onError: () => { store.setPlaybackState('error'); },
    });
  }

  private startSpeechProgressTimer(duration: number) {
    if (this.updateInterval) clearInterval(this.updateInterval);
    const start = Date.now();
    this.updateInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        this.stop();
      } else {
        useAudioStore.getState().setProgress(elapsed, duration);
      }
    }, 500);
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
