import { BOOK_MAPPING } from '../constants/bibleMapping';

export interface DailyReading {
  day: number;
  date?: string;
  readings: {
    display: string;
    chapters: string[]; // ["Genesis 1", "Genesis 2"]
  }[];
}

// Helper to get a 365 day Canonical plan
// This is a simplified track: ~3 chapters a day
export const canonicalPlan: DailyReading[] = Array.from({ length: 365 }, (_, i) => ({
  day: i + 1,
  readings: [] // Will be populated based on the full bible structure
}));

// Helper for title casing abbreviations as a fallback
const formatAbbrev = (abbrev: string) => {
  if (!abbrev) return 'Unknown';
  // Handle cases like "1gn" or "1kgs"
  return abbrev.charAt(0).toUpperCase() + abbrev.slice(1);
};

// We'll calculate the chunks in the code to ensure it's exact
export function getCanonicalPlan(books: any[]): DailyReading[] {
  if (!books || !Array.isArray(books) || books.length === 0) {
    console.warn('getCanonicalPlan: books is not a valid array', books);
    return Array.from({ length: 365 }, (_, i) => ({
      day: i + 1,
      readings: [{ display: 'Loading...', chapters: [] }]
    }));
  }

  const allChapters: string[] = [];
  books.forEach(b => {
    const bookName = BOOK_MAPPING[b.abbrev] || formatAbbrev(b.abbrev);
    if (b.chapters && Array.isArray(b.chapters)) {
      b.chapters.forEach((_: any, chIndex: number) => {
        allChapters.push(`${bookName} ${chIndex + 1}`);
      });
    }
  });

  if (allChapters.length === 0) {
    return Array.from({ length: 365 }, (_, i) => ({
      day: i + 1,
      readings: [{ display: 'No Scripture Found', chapters: [] }]
    }));
  }

  const totalChapters = allChapters.length;
  // Use a more nuanced distribution: Exactly 1189 total / 365 days
  const chaptersPerDay = totalChapters / 365;
  
  return Array.from({ length: 365 }, (_, i) => {
    const start = Math.floor(i * chaptersPerDay);
    const end = i === 364 ? totalChapters : Math.floor((i + 1) * chaptersPerDay);
    const dayChapters = allChapters.slice(start, end);
    
    if (dayChapters.length === 0) {
      return { day: i + 1, readings: [] };
    }

    const first = dayChapters[0];
    const last = dayChapters[dayChapters.length - 1];
    
    // Format Display: "Genesis 1-3" or "Genesis 1"
    const display = dayChapters.length > 1 
      ? `${first} - ${last.split(' ').pop()}`
      : first;

    return {
      day: i + 1,
      readings: [{
        display,
        chapters: dayChapters
      }]
    };
  });
}

// Curated Verse of the Day list (for 365 days)
// Adding a small sample for now, we can expand later
export const verseOfTheDay: Record<number, { ref: string, text: string }> = {
  1: { ref: "Genesis 1:1", text: "In the beginning, God created the heavens and the earth." },
  2: { ref: "John 1:1", text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
  // ... This will map to day of year
};

export function getMixedOTNTPlan(books: any[]): DailyReading[] {
  if (!books || !Array.isArray(books) || books.length === 0) {
    console.warn('getMixedOTNTPlan: books is not a valid array', books);
    return Array.from({ length: 365 }, (_, i) => ({
      day: i + 1,
      readings: [{ display: 'Loading...', chapters: [] }]
    }));
  }

  const otBooks = books.slice(0, 39);
  const ntBooks = books.slice(39);

  const getChapters = (bookList: any[]) => {
    const list: string[] = [];
    bookList.forEach(b => {
      const bookName = BOOK_MAPPING[b.abbrev] || formatAbbrev(b.abbrev);
      if (b.chapters && Array.isArray(b.chapters)) {
        b.chapters.forEach((_: any, i: number) => list.push(`${bookName} ${i + 1}`));
      }
    });
    return list;
  };

  const otChapters = getChapters(otBooks);
  const ntChapters = getChapters(ntBooks);

  if (otChapters.length === 0 && ntChapters.length === 0) {
    return Array.from({ length: 365 }, (_, i) => ({
      day: i + 1,
      readings: []
    }));
  }

  const otPerDay = otChapters.length / 365;
  const ntPerDay = ntChapters.length / 365;

  return Array.from({ length: 365 }, (_, i) => {
    const otStart = Math.floor(i * otPerDay);
    const otEnd = i === 364 ? otChapters.length : Math.floor((i + 1) * otPerDay);
    
    const ntStart = Math.floor(i * ntPerDay);
    const ntEnd = i === 364 ? ntChapters.length : Math.floor((i + 1) * ntPerDay);
    
    const dayOT = otChapters.slice(otStart, otEnd);
    const dayNT = ntChapters.slice(ntStart, ntEnd);

    const readings = [];
    if (dayOT.length > 0) {
      const first = dayOT[0];
      const last = dayOT[dayOT.length - 1];
      readings.push({
        display: dayOT.length > 1 
          ? `${first} - ${last.split(' ').pop()}` 
          : first,
        chapters: dayOT
      });
    }
    if (dayNT.length > 0) {
      const first = dayNT[0];
      const last = dayNT[dayNT.length - 1];
      readings.push({
        display: dayNT.length > 1 
          ? `${first} - ${last.split(' ').pop()}` 
          : first,
        chapters: dayNT
      });
    }

    return { day: i + 1, readings };
  });
}
