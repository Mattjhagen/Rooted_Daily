import * as SQLite from 'expo-sqlite';
import { BOOK_MAPPING } from '../../constants/bibleMapping';
const rawBibleData = require('../../data/bibleFull.json');
const getBooks = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.books && Array.isArray(data.books)) return data.books;
  if (data.default) return getBooks(data.default);
  if (data.default?.books) return data.default.books;
  return [];
};
const bibleData = getBooks(rawBibleData);

// Helper for title casing abbreviations as a fallback
const formatAbbrev = (abbrev: string) => {
  if (!abbrev) return 'Unknown';
  // Handle cases like "1gn" or "1kgs"
  return abbrev.charAt(0).toUpperCase() + abbrev.slice(1);
};

const db = SQLite.openDatabaseSync('rooted.db');

export const initializeBible = async (onProgress: (p: number) => void) => {
  try {
    const check = db.getFirstSync<{ count: number }>('SELECT count(*) as count FROM verses');
    if (check && check.count > 30000) {
      console.log('Bible already initialized');
      onProgress(1);
      return;
    }
  } catch (e) {
    // Table doesn't exist yet, continue with initialization
    console.log('Verses table not found, initializing...');
  }

  console.log('Starting Bible initialization...');
  
  // Create table
  db.execSync(`
    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book TEXT,
      chapter INTEGER,
      verse INTEGER,
      text TEXT,
      translation TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_verse_ref ON verses(book, chapter, verse);
  `);

  const totalBooks = bibleData.length;

  // Process one book at a time to keep UI responsive
  for (let i = 0; i < totalBooks; i++) {
    const bookObj = bibleData[i];
    const bookName = BOOK_MAPPING[bookObj.abbrev] || formatAbbrev(bookObj.abbrev);

    // Run each book in its own transaction for speed + responsiveness
    db.withTransactionSync(() => {
      bookObj.chapters.forEach((chapter: string[], chIdx: number) => {
        chapter.forEach((verseText: string, vIdx: number) => {
          db.runSync(
            'INSERT INTO verses (book, chapter, verse, text, translation) VALUES (?, ?, ?, ?, ?)',
            [bookName, chIdx + 1, vIdx + 1, verseText, 'WEB']
          );
        });
      });
    });

    // Report progress
    onProgress((i + 1) / totalBooks);

    // Yield to the event loop so the UI (LoadingScreen) can re-render
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  console.log('Bible initialization complete.');
};

export const getChapterCount = (bookName: string): number => {
  const book = bibleData.find((b: any) => {
    const name = (BOOK_MAPPING[b.abbrev] || b.abbrev) as string;
    return name.toLowerCase() === bookName.toLowerCase();
  });
  return book ? book.chapters.length : 0;
};

export const getVerse = (book: string, chapter: number, verse: number) => {
  return db.getFirstSync<{ text: string }>(
    'SELECT text FROM verses WHERE book = ? AND chapter = ? AND verse = ?',
    [book, chapter, verse]
  );
};

export const getChapter = (book: string, chapter: number) => {
  return db.getAllSync<{ verse: number, text: string }>(
    'SELECT verse, text FROM verses WHERE book = ? AND chapter = ? ORDER BY verse ASC',
    [book, chapter]
  );
};
