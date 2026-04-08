// src/features/audio/audioStore.ts

import { create } from 'zustand';

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AudioTrack {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
}

interface AudioState {
  currentTrack: AudioTrack | null;
  playbackState: PlaybackState;
  position: number;
  duration: number;
  
  // Actions
  setTrack: (track: AudioTrack | null) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setProgress: (position: number, duration: number) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentTrack: null,
  playbackState: 'idle',
  position: 0,
  duration: 0,

  setTrack: (track) => set({ currentTrack: track, position: 0, duration: 0 }),
  setPlaybackState: (state) => set({ playbackState: state }),
  setProgress: (position, duration) => set({ position, duration }),
  reset: () => set({ currentTrack: null, playbackState: 'idle', position: 0, duration: 0 }),
}));
