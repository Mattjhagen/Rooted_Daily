// src/features/bible/bibleService.ts

import * as SQLite from 'expo-sqlite';
import { initBibleDatabase } from './bibleLoader';

export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await initBibleDatabase();
  }
  return dbInstance;
}

export async function getVerse(book: string, chapter: number, verse: number): Promise<Verse | null> {
  const db = await getDb();
  const result = await db.getFirstAsync<Verse>(
    'SELECT book, chapter, verse, text FROM verses WHERE book = ? AND chapter = ? AND verse = ?',
    [book, chapter, verse]
  );
  return result;
}

export async function getChapter(book: string, chapter: number): Promise<Verse[]> {
  const db = await getDb();
  const results = await db.getAllAsync<Verse>(
    'SELECT book, chapter, verse, text FROM verses WHERE book = ? AND chapter = ? ORDER BY verse ASC',
    [book, chapter]
  );
  return results;
}

export async function searchVerses(query: string): Promise<Verse[]> {
  const db = await getDb();
  // Simple LIKE search for MVP
  const results = await db.getAllAsync<Verse>(
    'SELECT book, chapter, verse, text FROM verses WHERE text LIKE ? LIMIT 50',
    [`%${query}%`]
  );
  return results;
}

export async function getVersesInRange(book: string, chapter: number, start: number, end: number): Promise<Verse[]> {
  const db = await getDb();
  const results = await db.getAllAsync<Verse>(
    'SELECT book, chapter, verse, text FROM verses WHERE book = ? AND chapter = ? AND verse >= ? AND verse <= ? ORDER BY verse ASC',
    [book, chapter, start, end]
  );
  return results;
}
