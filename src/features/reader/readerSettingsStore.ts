import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReaderTheme = 'parchment' | 'white' | 'black';
export type ReaderFont = 'serif' | 'sans' | 'scholarly' | 'modern' | 'academic' | 'clean' | 'heirloom';
export type BibleVersion = 'WEB' | 'RT';

interface ReaderSettingsState {
  theme: ReaderTheme;
  fontSize: number;
  fontFamily: ReaderFont;
  isPublicMode: boolean;
  selectedVersion: BibleVersion;
  setTheme: (theme: ReaderTheme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: ReaderFont) => void;
  setPublicMode: (isPublic: boolean) => void;
  setSelectedVersion: (version: BibleVersion) => void;
}

export const useReaderSettings = create<ReaderSettingsState>()(
  persist(
    (set) => ({
      theme: 'parchment',
      fontSize: 19,
      fontFamily: 'serif',
      isPublicMode: false,
      selectedVersion: 'RT',
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setPublicMode: (isPublicMode) => set({ isPublicMode }),
      setSelectedVersion: (selectedVersion) => set({ selectedVersion }),
    }),
    {
      name: 'reader-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
