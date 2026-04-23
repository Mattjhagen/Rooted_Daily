import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { useAudioStore } from '../../features/audio/audioStore';

class AudioService {
  private player: any = null;
  private updateInterval: any = null;
  private currentSpeechText: string | null = null;
  private statusSubscription: any = null;

  async init() {
    await setAudioModeAsync({
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'doNotMix',
    });
  }

  async play(uri: string, title: string, subtitle?: string) {
    try {
      const store = useAudioStore.getState();
      
      // Stop current if playing
      if (this.player || this.currentSpeechText) {
        await this.stop();
      }

      // Ensure Audio Mode is active
      await setAudioModeAsync({
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        shouldRouteThroughEarpiece: false,
        interruptionMode: 'doNotMix',
      });

      // Use existing track text if we're just updating the URI
      const existingText = store.currentTrack?.text;
      store.setTrack({ id: uri, title, subtitle, url: uri, text: existingText });
      store.setPlaybackState('loading');

      if (uri.startsWith('speech://')) {
        const text = uri.replace('speech://', '');
        await this.playNativeSpeech(text);
        return;
      }

      // Create player
      const player = createAudioPlayer(uri, {
        updateInterval: 500,
        keepAudioSessionActive: true
      });
      
      this.player = player;

      // Set initial rate
      player.playbackRate = store.playbackRate;

      // Subscribe to status updates (New Audio API uses listeners)
      this.statusSubscription = player.addListener('playbackStatusUpdate', (status: any) => {
        this.onPlaybackStatusUpdate(status);
      });

      // Start playing
      player.play();
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
      this.player.playbackRate = rate;
    }
  }

  async pause() {
    if (this.player) {
      this.player.pause();
      useAudioStore.getState().setPlaybackState('paused');
    } else if (this.currentSpeechText) {
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
    } else if (this.currentSpeechText) {
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
    if (this.statusSubscription) {
      this.statusSubscription.remove();
      this.statusSubscription = null;
    }

    if (this.player) {
      this.player.pause();
      // In expo-audio, players are SharedObjects and can be cleaned up
      // but they don't have an explicit 'unload' like Sound. 
      // We just null it out if we're done.
      this.player = null;
    }

    if (this.currentSpeechText) {
      await Speech.stop();
      this.currentSpeechText = null;
    }

    this.stopProgressTimer();
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
    
    // expo-audio status has boolean flags and numeric values directly
    if (status.didJustFinish) {
      this.stop();
      return;
    }

    store.setPlaybackState(status.playing ? 'playing' : 'paused');
    // Note: status.currentTime and status.duration are in SECONDS in expo-audio
    // store.setProgress usually expects milliseconds based on previous code
    store.setProgress(status.currentTime * 1000, status.duration * 1000);
  };

  private startProgressTimer() {
    // legacy, expo-audio's playbackStatusUpdate listener handles this better
    // but keeping for compatibility if needed.
  }

  private stopProgressTimer() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const audioService = new AudioService();
