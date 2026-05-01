import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StealthState = 'NORMAL_MODE' | 'STEALTH_SETUP' | 'CALCULATOR_MODE' | 'BIBLE_MODE';

interface StealthStore {
  mode: StealthState;
  isLocked: boolean;
  pin: string | null;
  iconStyle: 'system' | 'dark' | 'light' | 'custom';
  
  // Actions
  setMode: (mode: StealthState) => void;
  setLocked: (isLocked: boolean) => void;
  setPin: (pin: string | null) => void;
  setIconStyle: (style: 'system' | 'dark' | 'light' | 'custom') => void;
  
  // Logic
  resetToCalculator: () => void;
}

export const useStealthStore = create<StealthStore>()(
  persist(
    (set, get) => ({
      mode: 'NORMAL_MODE',
      isLocked: false,
      pin: null,
      iconStyle: 'system',

      setMode: (mode) => set({ mode }),
      setLocked: (isLocked) => set({ isLocked }),
      setPin: (pin) => set({ pin }),
      setIconStyle: (iconStyle) => set({ iconStyle }),
      
      resetToCalculator: () => {
        const { mode } = get();
        if (mode !== 'NORMAL_MODE' && mode !== 'STEALTH_SETUP') {
          set({ isLocked: true, mode: 'CALCULATOR_MODE' });
        }
      },
    }),
    {
      name: 'stealth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
