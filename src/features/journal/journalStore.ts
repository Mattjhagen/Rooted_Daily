// src/features/journal/journalStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabase';

export interface JournalEntry {
  id: string;
  date: string;
  verseRef: string;
  verseText: string;
  note: string;
  type: 'reflection' | 'prayer';
  isFavorite?: boolean;
  isPublic?: boolean;
  userId?: string;
}

interface JournalState {
  entries: JournalEntry[];
  loading: boolean;
  addEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  syncEntries: () => Promise<void>;
  streak: number;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      loading: false,
      streak: 0,

      syncEntries: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from('journal')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (data) {
            const mappedEntries: JournalEntry[] = data.map(item => ({
              id: item.id,
              date: item.created_at,
              verseRef: item.verse_ref,
              verseText: item.verse_text,
              note: item.note,
              type: item.type as 'reflection' | 'prayer',
              isFavorite: item.is_favorite,
              isPublic: item.is_public,
              userId: item.user_id
            }));
            set({ entries: mappedEntries });
          }
        } catch (error) {
          console.error('Error syncing journal:', error);
        } finally {
          set({ loading: false });
        }
      },

      addEntry: async (entry) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Optimistic local update
        const tempId = Math.random().toString(36).substring(7);
        const newEntry = { ...entry, id: tempId };
        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));

        if (user) {
          try {
            // Robust parsing of "Book Chapter:Verse"
            // Handles "John 3:16", "1 John 1:9", "Genesis 1:1-3", "Psalm 119:105"
            const refRegex = /^(.+)\s(\d+):(\d+)/;
            const match = entry.verseRef.match(refRegex);
            
            const book = match ? match[1] : entry.verseRef.split(' ').slice(0, -1).join(' ') || 'General';
            const chapter = match ? parseInt(match[2]) : parseInt(entry.verseRef.split(' ').pop()?.split(':')[0] || '0');
            const verse = match ? parseInt(match[3]) : parseInt(entry.verseRef.split(':').pop() || '0');

            const { data, error } = await supabase
              .from('journal')
              .insert({
                user_id: user.id,
                verse_ref: entry.verseRef,
                verse_text: entry.verseText,
                note: entry.note,
                type: entry.type,
                is_favorite: entry.isFavorite || false,
                is_public: entry.isPublic || false,
                book,
                chapter,
                verse,
              })
              .select()
              .single();

            if (error) throw error;
            
            // Replace temp ID with real DB ID
            if (data) {
              set((state) => ({
                entries: state.entries.map(e => e.id === tempId ? { ...e, id: data.id } : e)
              }));
            }
          } catch (error) {
            console.error('Failed to save to Supabase:', error);
          }
        }
      },

      removeEntry: async (id) => {
        // Optimistic update
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user && !id.startsWith('temp_')) {
          try {
            const { error } = await supabase
              .from('journal')
              .delete()
              .eq('id', id);
            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete from Supabase:', error);
          }
        }
      },

      toggleFavorite: async (id) => {
        const entry = get().entries.find(e => e.id === id);
        if (!entry) return;

        const newFavorite = !entry.isFavorite;

        // Optimistic update
        set((state) => ({
          entries: state.entries.map((e) =>
            e.id === id ? { ...e, isFavorite: newFavorite } : e
          ),
        }));

        const { data: { user } } = await supabase.auth.getUser();
        if (user && !id.startsWith('temp_')) {
          try {
            const { error } = await supabase
              .from('journal')
              .update({ is_favorite: newFavorite })
              .eq('id', id);
            if (error) throw error;
          } catch (error) {
            console.error('Failed to update favorite in Supabase:', error);
          }
        }
      },
    }),
    {
      name: 'rooted-journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
