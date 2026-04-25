import { useAudioPlayer, createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { useAudioStore } from '../../features/audio/audioStore';

class AudioService {
  private player: AudioPlayer | null = null;
  private currentSpeechText: string | null = null;
  private updateInterval: any = null;

  async init() {
    // Initial setup if needed
  }

  async play(uri: string, title: string, subtitle?: string) {
    try {
      const store = useAudioStore.getState();
      
      // Stop current if playing
      if (this.player) {
        this.player.pause();
        this.player.replace(null);
      }

      const existingText = store.currentTrack?.text;
      store.setTrack({ id: uri, title, subtitle, url: uri, text: existingText });
      store.setPlaybackState('loading');

      if (uri.startsWith('speech://')) {
        const text = uri.replace('speech://', '');
        await this.playNativeSpeech(text);
        return;
      }

      // Create new player with expo-audio
      this.player = createAudioPlayer(uri);
      
      // Configure playback
      this.player.playbackRate = store.playbackRate;
      this.player.shouldKeepScreenOn = true;
      
      // Add status listener
      this.player.addListener('statusChange', (status) => {
        if (status === 'playing') store.setPlaybackState('playing');
        if (status === 'paused') store.setPlaybackState('paused');
        if (status === 'finished') this.stop();
        if (status === 'error') store.setPlaybackState('error');
      });

      this.player.play();
      this.startProgressTimer();
      
    } catch (error) {
      console.error('Playback failed', error);
      useAudioStore.getState().setPlaybackState('error');
    }
  }

  async setPlaybackRate(rate: number) {
    const store = useAudioStore.getState();
    store.setPlaybackRate(rate);
    
    if (this.player) {
      this.player.playbackRate = rate;
    }
  }

  async pause() {
    if (this.player) {
      this.player.pause();
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
    if (this.player) {
      this.player.play();
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
    if (this.player) {
      this.stopProgressTimer();
      this.player.pause();
      this.player = null;
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
      voice: store.preferredVoiceIdentifier || undefined,
      rate: store.playbackRate,
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

  private startProgressTimer() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(async () => {
      if (this.player) {
        useAudioStore.getState().setProgress(this.player.currentTime, this.player.duration);
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
