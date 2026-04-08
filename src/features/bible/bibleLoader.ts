// src/features/bible/bibleLoader.ts

import * as SQLite from 'expo-sqlite';
import webuData from '../../data/webu.json';

const DATABASE_NAME = 'bible.db';

export async function initBibleDatabase() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // Check if table exists
  const tableCheck = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='verses';"
  );

  if (tableCheck.length === 0) {
    console.log('Initializing Bible Database...');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book TEXT,
        chapter INTEGER,
        verse INTEGER,
        text TEXT
      );
      CREATE INDEX idx_book_chap_verse ON verses(book, chapter, verse);
    `);

    // Bulk insert
    // Note: SQLite has limit on number of parameters. We'll do it by book.
    for (const bookEntry of webuData) {
      const book = bookEntry.book;
      for (const chapterEntry of bookEntry.chapters) {
        const chapter = chapterEntry.chapter;
        for (const verseEntry of chapterEntry.verses) {
          await db.runAsync(
            'INSERT INTO verses (book, chapter, verse, text) VALUES (?, ?, ?, ?)',
            [book, chapter, verseEntry.verse, verseEntry.text]
          );
        }
      }
    }
    console.log('Bible Database Initialized.');
  }

  return db;
}
