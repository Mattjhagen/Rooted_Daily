const fs = require('fs');
const path = require('path');

const rawPath = path.join(__dirname, '..', 'src', 'data', 'raw_web.json');
const outPath = path.join(__dirname, '..', 'src', 'data', 'bibleFull.json');

const mapping = { 
  1: 'gn', 2: 'ex', 3: 'lv', 4: 'nm', 5: 'dt', 6: 'js', 7: 'jud', 8: 'rt', 
  9: '1sm', 10: '2sm', 11: '1kgs', 12: '2kgs', 13: '1ch', 14: '2ch', 15: 'ezr', 16: 'ne', 
  17: 'et', 18: 'job', 19: 'ps', 20: 'prv', 21: 'ec', 22: 'so', 23: 'is', 24: 'jr', 
  25: 'lm', 26: 'ez', 27: 'dn', 28: 'ho', 29: 'jl', 30: 'am', 31: 'ob', 32: 'jn', 
  33: 'mi', 34: 'na', 35: 'hk', 36: 'zp', 37: 'hg', 38: 'zc', 39: 'ml', 40: 'mt', 
  41: 'mk', 42: 'lk', 43: 'jo', 44: 'act', 45: 'rm', 46: '1co', 47: '2co', 48: 'gl', 
  49: 'eph', 50: 'ph', 51: 'cl', 52: '1ts', 53: '2ts', 54: '1tm', 55: '2tm', 56: 'tt', 
  57: 'phm', 58: 'hb', 59: 'jm', 60: '1pe', 61: '2pe', 62: '1jo', 63: '2jo', 64: '3jo', 
  65: 'jd', 66: 're' 
};

try {
  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const bible = { books: [] };
  const booksMap = {};

  rawData.forEach(v => {
    const abbrev = mapping[v.book];
    if (!abbrev) return;
    
    if (!booksMap[abbrev]) {
      booksMap[abbrev] = { abbrev, chapters: [] };
      bible.books.push(booksMap[abbrev]);
    }
    
    const book = booksMap[abbrev];
    if (!book.chapters[v.chapter - 1]) book.chapters[v.chapter - 1] = [];
    book.chapters[v.chapter - 1][v.verse - 1] = v.text;
  });

  fs.writeFileSync(outPath, JSON.stringify(bible));
  console.log(`Success! Transformed ${rawData.length} verses.`);
} catch (e) {
  console.error('Transformation failed:', e.message);
}
