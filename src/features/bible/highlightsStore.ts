import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Highlight {
  ref: string; // e.g. "Genesis 1:1"
  color: string;
}

interface HighlightsState {
  highlights: Record<string, string>; // ref -> color
  
  // Actions
  setHighlight: (ref: string, color: string) => void;
  removeHighlight: (ref: string) => void;
  getHighlight: (ref: string) => string | undefined;
}

export const useHighlightsStore = create<HighlightsState>()(
  persist(
    (set, get) => ({
      highlights: {},

      setHighlight: (ref, color) => {
        set(state => ({
          highlights: {
            ...state.highlights,
            [ref]: color
          }
        }));
      },

      removeHighlight: (ref) => {
        set(state => {
          const newHighlights = { ...state.highlights };
          delete newHighlights[ref];
          return { highlights: newHighlights };
        });
      },

      getHighlight: (ref) => {
        return get().highlights[ref];
      },
    }),
    {
      name: 'rooted-highlights-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
