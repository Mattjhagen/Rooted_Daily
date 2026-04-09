import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DevotionalProgress {
  date: string;
  readBible: boolean;
  reflected: boolean;
  completed: boolean;
}

interface PersistenceState {
  lastReadRef: string | null;
  devotionalProgress: Record<string, DevotionalProgress>;
  streakCount: number;
  points: number;
  lastCheckInDate: string | null;
  updateLastReadRef: (ref: string) => void;
  updateDevotionalProgress: (date: string, updates: Partial<DevotionalProgress>) => void;
  getDevotionalProgress: (date: string) => DevotionalProgress;
  performCheckIn: () => { pointsEarned: number; newStreak: number } | null;
}

export const usePersistenceStore = create<PersistenceState>()(
  persist(
    (set, get) => ({
      lastReadRef: null,
      devotionalProgress: {},
      streakCount: 0,
      points: 0,
      lastCheckInDate: null,
      
      updateLastReadRef: (lastReadRef) => set({ lastReadRef }),
      
      updateDevotionalProgress: (date, updates) => {
        const current = get().getDevotionalProgress(date);
        const next = { ...current, ...updates };
        
        // Auto-complete if both major milestones are met
        if (next.readBible && next.reflected) {
          next.completed = true;
        }

        set({
          devotionalProgress: {
            ...get().devotionalProgress,
            [date]: next
          }
        });
      },

      performCheckIn: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.lastCheckInDate === today) return null;

        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        let newStreak = state.streakCount;
        if (state.lastCheckInDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        const pointsEarned = 10;
        set({
          streakCount: newStreak,
          points: state.points + pointsEarned,
          lastCheckInDate: today
        });

        return { pointsEarned, newStreak };
      },

      getDevotionalProgress: (date) => {
        return get().devotionalProgress[date] || {
          date,
          readBible: false,
          reflected: false,
          completed: false
        };
      },
    }),
    {
      name: 'app-persistence',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
