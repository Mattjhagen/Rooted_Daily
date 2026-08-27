// src/features/bible/BibleEngine.ts

import * as SQLite from 'expo-sqlite';
import { useReaderSettings } from '../reader/readerSettingsStore';
import { getChapter as getWebChapter, getVerse as getWebVerse } from './bibleService';

export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

const db = SQLite.openDatabaseSync('rooted.db');

/**
 * The BibleEngine bridges different translations and handles version-specific logic.
 * It primarily distinguishes between the Rooted Translation (RT) and the 
 * World English Bible (WEB).
 */
export const BibleEngine = {
  /**
   * Loads a full chapter, swapping text based on the selected version.
   */
  async getChapter(book: string, chapter: number, version: 'WEB' | 'RT'): Promise<Verse[]> {
    if (version === 'WEB') {
      const verses = await getWebChapter(book, chapter);
      return verses.map(v => ({ ...v, translation: 'WEB' }));
    }

    // For RT, we check the 'verses' table where translation = 'RT'
    // If not found, we fallback to WEB (as the RT is being progressively built)
    const rtVerses = await db.getAllAsync<Verse>(
      'SELECT book, chapter, verse, text, translation FROM verses WHERE book = ? AND chapter = ? AND translation = ? ORDER BY verse ASC',
      [book, chapter, 'RT']
    );

    if (rtVerses.length > 0) {
      return rtVerses;
    }

    // Fallback to WEB if RT is missing for this chapter
    const webVerses = await getWebChapter(book, chapter);
    return webVerses.map(v => ({ ...v, translation: 'WEB' }));
  },

  /**
   * Retrieves a single verse.
   */
  async getVerse(book: string, chapter: number, verse: number, version: 'WEB' | 'RT'): Promise<Verse | null> {
    const translation = version === 'RT' ? 'RT' : 'WEB';
    
    let result = await db.getFirstAsync<Verse>(
      'SELECT book, chapter, verse, text, translation FROM verses WHERE book = ? AND chapter = ? AND verse = ? AND translation = ?',
      [book, chapter, verse, translation]
    );

    // Fallback for RT
    if (!result && version === 'RT') {
      result = await db.getFirstAsync<Verse>(
        'SELECT book, chapter, verse, text, translation FROM verses WHERE book = ? AND chapter = ? AND verse = ? AND translation = ?',
        [book, chapter, verse, 'WEB']
      );
    }

    return result;
  },

  /**
   * Filtering logic for notes based on privacy settings.
   */
  filterNotes(notes: any[], isPublicMode: boolean, userId: string) {
    if (isPublicMode) {
      // In public mode, show everything shared + personal
      return notes.filter(n => n.is_public || n.user_id === userId);
    } else {
      // In private mode, show only personal notes and AI insights
      return notes.filter(n => n.user_id === userId || n.author === 'LLT Insight');
    }
  }
};
