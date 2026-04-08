// src/features/bible/bibleParser.ts

const BOOK_ALIASES: Record<string, string> = {
  'gen': 'Genesis', 'ex': 'Exodus', 'lev': 'Leviticus',
  'num': 'Numbers', 'deut': 'Deuteronomy', 'josh': 'Joshua',
  'judg': 'Judges', 'ruth': 'Ruth', '1 sam': '1 Samuel',
  '2 sam': '2 Samuel', '1 ki': '1 Kings', '2 ki': '2 Kings',
  '1 chr': '1 Chronicles', '2 chr': '2 Chronicles', 'ezra': 'Ezra',
  'neh': 'Nehemiah', 'esth': 'Esther', 'job': 'Job',
  'ps': 'Psalms', 'prov': 'Proverbs', 'eccl': 'Ecclesiastes',
  'song': 'Song of Solomon', 'isa': 'Isaiah', 'jer': 'Jeremiah',
  'lam': 'Lamentations', 'ezek': 'Ezekiel', 'dan': 'Daniel',
  'hos': 'Hosea', 'joel': 'Joel', 'amos': 'Amos', 'obad': 'Obadiah',
  'jonah': 'Jonah', 'mic': 'Micah', 'nah': 'Nahum', 'hab': 'Habakkuk',
  'zeph': 'Zephaniah', 'hag': 'Haggai', 'zech': 'Zechariah',
  'mal': 'Malachi', 'matt': 'Matthew', 'mark': 'Mark', 'luke': 'Luke',
  'john': 'John', 'acts': 'Acts', 'rom': 'Romans',
  '1 cor': '1 Corinthians', '2 cor': '2 Corinthians', 'gal': 'Galatians',
  'eph': 'Ephesians', 'phil': 'Philippians', 'col': 'Colossians',
  '1 thess': '1 Thessalonians', '2 thess': '2 Thessalonians',
  '1 tim': '1 Timothy', '2 tim': '2 Timothy', 'titus': 'Titus',
  'phlm': 'Philemon', 'heb': 'Hebrews', 'jas': 'James',
  '1 pet': '1 Peter', '2 pet': '2 Peter', '1 john': '1 John',
  '2 john': '2 John', '3 john': '3 John', 'jude': 'Jude', 'rev': 'Revelation',
}

// Full book names also recognized
const FULL_BOOKS = Object.values(BOOK_ALIASES)

export const VERSE_REF_REGEX =
  /\b((?:\d\s)?[A-Za-z]+(?:\s[A-Za-z]+)?)\s(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?\b/g

export interface ParsedVerseRef {
  raw: string
  book: string
  chapter: number
  verseStart: number
  verseEnd?: number
  ref: string  // canonical: "John 3:16" or "John 3:16-17"
}

export function parseVerseReferences(text: string): ParsedVerseRef[] {
  const refs: ParsedVerseRef[] = []
  let match: RegExpExecArray | null

  // Reset regex state
  VERSE_REF_REGEX.lastIndex = 0;

  while ((match = VERSE_REF_REGEX.exec(text)) !== null) {
    const bookRaw = match[1].trim()
    const bookNorm = bookRaw.toLowerCase()
    const resolvedBook =
      BOOK_ALIASES[bookNorm] ||
      FULL_BOOKS.find(b => b.toLowerCase() === bookNorm) ||
      bookRaw

    const chapter = parseInt(match[2])
    const verseStart = parseInt(match[3])
    const verseEnd = match[4] ? parseInt(match[4]) : undefined

    refs.push({
      raw: match[0],
      book: resolvedBook,
      chapter,
      verseStart,
      verseEnd,
      ref: verseEnd
        ? `${resolvedBook} ${chapter}:${verseStart}-${verseEnd}`
        : `${resolvedBook} ${chapter}:${verseStart}`,
    })
  }

  return refs
}
