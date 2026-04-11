// src/features/devotionals/adminStore.ts

import { create } from 'zustand';

interface AdminState {
  isAdminAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdminAuthenticated: false,
  setAuthenticated: (value) => set({ isAdminAuthenticated: value }),
  logout: () => set({ isAdminAuthenticated: false }),
}));
