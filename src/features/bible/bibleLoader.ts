import * as SQLite from 'expo-sqlite';
const rawBibleData = require('../../data/bibleFull.json');
const getBooks = (data: any) => {
  if (Array.isArray(data)) return data;
  if (data.books && Array.isArray(data.books)) return data.books;
  if (data.default) return getBooks(data.default);
  return [];
};
const bibleData = getBooks(rawBibleData);

const db = SQLite.openDatabaseSync('rooted.db');

const BOOK_MAPPING: Record<string, string> = {
  gn: "Genesis", ex: "Exodus", lv: "Leviticus", nm: "Numbers", dt: "Deuteronomy",
  js: "Joshua", jud: "Judges", rt: "Ruth", "1sm": "1 Samuel", "2sm": "2 Samuel",
  "1kgs": "1 Kings", "2kgs": "2 Kings", "1ch": "1 Chronicles", "2ch": "2 Chronicles",
  ezr: "Ezra", ne: "Nehemiah", et: "Esther", job: "Job", ps: "Psalms", prv: "Proverbs",
  ec: "Ecclesiastes", so: "Song of Solomon", is: "Isaiah", jr: "Jeremiah", lm: "Lamentations",
  ez: "Ezekiel", dn: "Daniel", ho: "Hosea", jl: "Joel", am: "Amos", ob: "Obadiah",
  jn: "Jonah", mi: "Micah", na: "Nahum", hk: "Habakkuk", zp: "Zephaniah", hg: "Haggai",
  zc: "Zechariah", ml: "Malachi", mt: "Matthew", mk: "Mark", lk: "Luke", jo: "John",
  act: "Acts", rm: "Romans", "1co": "1 Corinthians", "2co": "2 Corinthians", gl: "Galatians",
  eph: "Ephesians", ph: "Philippians", cl: "Colossians", "1ts": "1 Thessalonians",
  "2ts": "2 Thessalonians", "1tm": "1 Timothy", "2tm": "2 Timothy", tt: "Titus",
  phm: "Philemon", hb: "Hebrews", jm: "James", "1pe": "1 Peter", "2pe": "2 Peter",
  "1jo": "1 John", "2jo": "2 John", "3jo": "3 John", jd: "Jude", re: "Revelation"
};

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
  let processedBooks = 0;

  // Use a transaction for speed
  db.withTransactionSync(() => {
    for (const bookObj of bibleData) {
      const bookName = BOOK_MAPPING[bookObj.abbrev] || bookObj.abbrev;
      
      bookObj.chapters.forEach((chapter: string[], chIdx: number) => {
        chapter.forEach((verseText: string, vIdx: number) => {
          db.runSync(
            'INSERT INTO verses (book, chapter, verse, text, translation) VALUES (?, ?, ?, ?, ?)',
            [bookName, chIdx + 1, vIdx + 1, verseText, 'KJV']
          );
        });
      });
      
      processedBooks++;
      // This is sync, so we can't really "yield" for UI, but we'll try to update
      // In a real app we'd use chunks and requestAnimationFrame or a worker
    }
  });
  
  onProgress(1);
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
