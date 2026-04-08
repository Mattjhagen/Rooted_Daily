// src/features/journal/journalStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PRIVACY: User journal entries are stored only in AsyncStorage on-device.
 * No journal data is transmitted to any server.
 * All personal notes and reflections remain on your device.
 */

export interface JournalEntry {
  id: string;
  date: string;
  verseRef: string;
  verseText: string;
  note: string;
  type: 'reflection' | 'prayer';
  isFavorite?: boolean;
}

interface JournalState {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  removeEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;
  streak: number;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      streak: 0,
      addEntry: (entry) => {
        const id = Math.random().toString(36).substring(7);
        const newEntry = { ...entry, id };
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));
        // Update streak logic would go here
      },
      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));
      },
      toggleFavorite: (id) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, isFavorite: !e.isFavorite } : e
          ),
        }));
      },
    }),
    {
      name: 'rooted-journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
