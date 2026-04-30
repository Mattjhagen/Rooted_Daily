import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { useAudioStore } from '../../features/audio/audioStore';

class AudioService {
  private player: AudioPlayer | null = null;
  private updateInterval: any = null;
  private currentSpeechText: string | null = null;
  private statusSubscription: { remove(): void } | null = null;

  async init() {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      shouldRouteThroughEarpiece: false,
    });
  }

  async play(uri: string, title: string, subtitle?: string) {
    try {
      const store = useAudioStore.getState();
      if (this.player) {
        await this.stop();
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
        shouldRouteThroughEarpiece: false,
      });
      const existingText = store.currentTrack?.text;
      store.setTrack({ id: uri, title, subtitle, url: uri, text: existingText });
      store.setPlaybackState('loading');
      if (uri.startsWith('speech://')) {
        const text = uri.replace('speech://', '');
        await this.playNativeSpeech(text);
        return;
      }
      this.player = createAudioPlayer({ uri }, { updateInterval: 500 });
      this.statusSubscription = this.player.addListener('playbackStatusUpdate', this.onPlaybackStatusUpdate);
      this.player.setPlaybackRate(store.playbackRate, 'high');
      this.player.volume = 1.0;
      this.player.play();
      store.setPlaybackState('playing');
    } catch (error) {
      console.error('Playback failed', error);
      useAudioStore.getState().setPlaybackState('error');
    }
  }

  async setPlaybackRate(rate: number) {
    const store = useAudioStore.getState();
    store.setPlaybackRate(rate);
    if (this.player) {
      this.player.setPlaybackRate(rate, 'high');
    }
  }

  async pause() {
    if (this.player) {
      this.player.pause();
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
    if (this.player) {
      this.player.play();
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
    if (this.player) {
      this.stopProgressTimer();
      if (this.statusSubscription) {
        this.statusSubscription.remove();
        this.statusSubscription = null;
      }
      this.player.pause();
      this.player.remove();
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

  private onPlaybackStatusUpdate = (status: { isLoaded: boolean; didJustFinish: boolean; playing: boolean; currentTime: number; duration: number }) => {
    const store = useAudioStore.getState();
    if (status.isLoaded) {
      if (status.didJustFinish) {
        this.stop();
      } else {
        store.setPlaybackState(status.playing ? 'playing' : 'paused');
        store.setProgress(status.currentTime * 1000, (status.duration || 0) * 1000);
      }
    }
  };

  private stopProgressTimer() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const audioService = new AudioService();
