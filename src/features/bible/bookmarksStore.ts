import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Bookmark {
  ref: string;
  timestamp: string;
}

interface BookmarksState {
  bookmarks: Bookmark[];
  addBookmark: (ref: string) => void;
  removeBookmark: (ref: string) => void;
  isBookmarked: (ref: string) => boolean;
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (ref) => {
        const exists = get().bookmarks.some(b => b.ref === ref);
        if (!exists) {
          set({ bookmarks: [...get().bookmarks, { ref, timestamp: new Date().toISOString() }] });
        }
      },
      removeBookmark: (ref) => {
        set({ bookmarks: get().bookmarks.filter(b => b.ref !== ref) });
      },
      isBookmarked: (ref) => {
        return get().bookmarks.some(b => b.ref === ref);
      },
    }),
    {
      name: 'bible-bookmarks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
