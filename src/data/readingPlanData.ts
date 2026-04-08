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

// We'll calculate the chunks in the code to ensure it's exact
export function getCanonicalPlan(books: any[]): DailyReading[] {
  if (!books || !Array.isArray(books)) {
    console.warn('getCanonicalPlan: books is not an array', books);
    return [];
  }
  const allChapters: string[] = [];
  books.forEach(b => {
    b.chapters.forEach((_: any, chIndex: number) => {
      allChapters.push(`${b.name} ${chIndex + 1}`);
    });
  });

  const totalChapters = allChapters.length;
  const chaptersPerDay = Math.ceil(totalChapters / 365);
  
  return Array.from({ length: 365 }, (_, i) => {
    const start = i * chaptersPerDay;
    const end = Math.min(start + chaptersPerDay, totalChapters);
    const dayChapters = allChapters.slice(start, end);
    
    return {
      day: i + 1,
      readings: [{
        display: dayChapters.length > 1 
          ? `${dayChapters[0]} - ${dayChapters[dayChapters.length - 1].split(' ').pop()}`
          : dayChapters[0],
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
  if (!books || !Array.isArray(books)) {
    console.warn('getMixedOTNTPlan: books is not an array', books);
    return [];
  }
  const otBooks = books.slice(0, 39);
  const ntBooks = books.slice(39);

  const getChapters = (bookList: any[]) => {
    const list: string[] = [];
    bookList.forEach(b => {
      b.chapters.forEach((_: any, i: number) => list.push(`${b.name || b.abbrev} ${i + 1}`));
    });
    return list;
  };

  const otChapters = getChapters(otBooks);
  const ntChapters = getChapters(ntBooks);

  const otPerDay = Math.ceil(otChapters.length / 365);
  const ntPerDay = Math.ceil(ntChapters.length / 365);

  return Array.from({ length: 365 }, (_, i) => {
    const otStart = i * otPerDay;
    const ntStart = i * ntPerDay;
    
    const dayOT = otChapters.slice(otStart, Math.min(otStart + otPerDay, otChapters.length));
    const dayNT = ntChapters.slice(ntStart, Math.min(ntStart + ntPerDay, ntChapters.length));

    const readings = [];
    if (dayOT.length > 0) {
      readings.push({
        display: dayOT.length > 1 
          ? `${dayOT[0]} - ${dayOT[dayOT.length-1].split(' ').pop()}` 
          : dayOT[0],
        chapters: dayOT
      });
    }
    if (dayNT.length > 0) {
      readings.push({
        display: dayNT.length > 1 
          ? `${dayNT[0]} - ${dayNT[dayNT.length-1].split(' ').pop()}` 
          : dayNT[0],
        chapters: dayNT
      });
    }

    return { day: i + 1, readings };
  });
}
