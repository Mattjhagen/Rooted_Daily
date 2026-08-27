import { create } from 'zustand';
import { DEFAULT_LICENSE_FREE_BIBLE_VERSION } from '@youversion/platform-core';

interface YouVersionState {
  selectedVersionId: number;
  selectedVersionAbbrev: string;
  setSelectedVersion: (versionId: number, abbrev: string) => void;
}

export const useYouVersionStore = create<YouVersionState>((set) => ({
  selectedVersionId: DEFAULT_LICENSE_FREE_BIBLE_VERSION,
  selectedVersionAbbrev: 'BSB',
  setSelectedVersion: (versionId, abbrev) => set({ selectedVersionId: versionId, selectedVersionAbbrev: abbrev }),
}));
