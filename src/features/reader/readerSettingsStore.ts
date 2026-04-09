import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReaderTheme = 'parchment' | 'white' | 'black';
export type ReaderFont = 'serif' | 'sans' | 'scholarly' | 'modern' | 'academic' | 'clean';

interface ReaderSettingsState {
  theme: ReaderTheme;
  fontSize: number;
  fontFamily: ReaderFont;
  setTheme: (theme: ReaderTheme) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: ReaderFont) => void;
}

export const useReaderSettings = create<ReaderSettingsState>()(
  persist(
    (set) => ({
      theme: 'parchment',
      fontSize: 19,
      fontFamily: 'serif',
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
    }),
    {
      name: 'reader-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
