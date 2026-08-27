import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlanProgress {
  planId: string;
  completedChapters: string[]; // Format: "Book Chapter" e.g. "Genesis 1"
  startDate: string;
  lastReadDate: string | null;
}

interface PlansState {
  activePlans: PlanProgress[];
  
  // Actions
  toggleChapter: (planId: string, chapterRef: string) => void;
  startPlan: (planId: string) => void;
  getPlanProgress: (planId: string) => PlanProgress | undefined;
  isChapterCompleted: (planId: string, chapterRef: string) => boolean;
}

export const usePlansStore = create<PlansState>()(
  persist(
    (set, get) => ({
      activePlans: [],

      startPlan: (planId) => {
        const existing = get().activePlans.find(p => p.planId === planId);
        if (existing) return;

        const newPlan: PlanProgress = {
          planId,
          completedChapters: [],
          startDate: new Date().toISOString(),
          lastReadDate: null,
        };

        set(state => ({
          activePlans: [...state.activePlans, newPlan]
        }));
      },

      toggleChapter: (planId, chapterRef) => {
        set(state => ({
          activePlans: state.activePlans.map(p => {
            if (p.planId !== planId) return p;
            
            const isCompleted = p.completedChapters.includes(chapterRef);
            return {
              ...p,
              completedChapters: isCompleted
                ? p.completedChapters.filter(c => c !== chapterRef)
                : [...p.completedChapters, chapterRef],
              lastReadDate: new Date().toISOString()
            };
          })
        }));
      },

      getPlanProgress: (planId) => {
        return get().activePlans.find(p => p.planId === planId);
      },

      isChapterCompleted: (planId, chapterRef) => {
        const plan = get().activePlans.find(p => p.planId === planId);
        return plan ? plan.completedChapters.includes(chapterRef) : false;
      },
    }),
    {
      name: 'rooted-plans-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
