const fs = require('fs');
const path = require('path');

const books = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
  "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians",
  "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

async function fetchBible() {
  const bible = {
    name: "World English Bible",
    version: "WEB",
    books: []
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  for (const book of books) {
    let success = false;
    let retries = 3;

    while (!success && retries > 0) {
      console.log(`Fetching ${book}... (${retries} retries left)`);
      try {
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(book)}?translation=web`);
        if (!response.ok) throw new Error(`HTTP ${response.status} for ${book}`);
        
        const data = await response.json();
        
        const bookData = {
          name: book,
          chapters: []
        };

        const chaptersMap = {};
        data.verses.forEach(v => {
          if (!chaptersMap[v.chapter]) chaptersMap[v.chapter] = [];
          
          // Use full text
          const verseText = v.text.trim().replace(/\s+/g, ' ');
          // Ensure we don't end up with holes in the array
          chaptersMap[v.chapter][v.verse - 1] = verseText;
        });

        Object.keys(chaptersMap).sort((a,b) => parseInt(a) - parseInt(b)).forEach(ch => {
          bookData.chapters.push(chaptersMap[ch]);
        });

        bible.books.push(bookData);
        success = true;
        console.log(`Successfully fetched ${book}.`);
      } catch (error) {
        console.error(`Error fetching ${book}:`, error.message);
        retries--;
        await delay(2000); // Wait longer on error
      }
    }
    await delay(300); // Respect the API
  }

  const outputPath = path.join(process.cwd(), 'src/data/bibleFull.json');
  fs.writeFileSync(outputPath, JSON.stringify(bible, null, 2));
  console.log(`Bible download complete! Saved to ${outputPath}`);
}

fetchBible();
