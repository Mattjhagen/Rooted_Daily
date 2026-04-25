// src/features/audio/audioStore.ts

import { create } from 'zustand';

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
  text?: string; // Original scripture text for full player
}

interface AudioState {
  currentTrack: AudioTrack | null;
  playbackState: PlaybackState;
  position: number;
  duration: number;
  isFullPlayerVisible: boolean;
  isKaraokeEnabled: boolean;
  playbackRate: number;
  preferredVoiceIdentifier: string | null;
  
  // Actions
  setTrack: (track: AudioTrack | null) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setProgress: (position: number, duration: number) => void;
  setFullPlayerVisible: (visible: boolean) => void;
  setKaraokeEnabled: (enabled: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setPreferredVoiceIdentifier: (id: string | null) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentTrack: null,
  playbackState: 'idle',
  position: 0,
  duration: 0,
  isFullPlayerVisible: false,
  isKaraokeEnabled: true, // Enabled by default
  playbackRate: 1.0,
  preferredVoiceIdentifier: null,

  setTrack: (track) => set({ currentTrack: track, position: 0, duration: 0 }),
  setPlaybackState: (state) => set({ playbackState: state }),
  setProgress: (position, duration) => set({ position, duration }),
  setFullPlayerVisible: (visible) => set({ isFullPlayerVisible: visible }),
  setKaraokeEnabled: (enabled) => set({ isKaraokeEnabled: enabled }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setPreferredVoiceIdentifier: (id) => set({ preferredVoiceIdentifier: id }),
  reset: () => set({ currentTrack: null, playbackState: 'idle', position: 0, duration: 0, isFullPlayerVisible: false, playbackRate: 1.0, preferredVoiceIdentifier: null }),
}));
