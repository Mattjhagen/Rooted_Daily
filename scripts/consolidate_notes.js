const fs = require('fs');
const path = require('path');

const LLT_BASE_DIR = path.join(__dirname, '../json/llt');
const OUTPUT_FILE = path.join(__dirname, '../src/data/allFootnotes.json');

function consolidateNotes() {
  const allNotes = [];
  
  if (!fs.existsSync(LLT_BASE_DIR)) {
    console.error('LLT base directory not found');
    return;
  }

  const books = fs.readdirSync(LLT_BASE_DIR);
  console.log(`Found ${books.length} items in LLT base dir`);
  
  books.forEach(book => {
    const bookPath = path.join(LLT_BASE_DIR, book);
    if (!fs.statSync(bookPath).isDirectory()) return;
    
    const chapters = fs.readdirSync(bookPath);
    console.log(`Processing ${book} (${chapters.length} chapters)...`);
    chapters.forEach(chapterFile => {
      if (!chapterFile.endsWith('.json')) return;
      
      const chapterPath = path.join(bookPath, chapterFile);
      const data = JSON.parse(fs.readFileSync(chapterPath, 'utf8'));
      
      if (data.footnotes && Array.isArray(data.footnotes)) {
        data.footnotes.forEach(note => {
          if (note.content && note.content.trim() !== '') {
            allNotes.push({
              book: data.book,
              chapter: data.chapter,
              verse: note.verse,
              content: note.content,
              author: note.author,
              type: note.type
            });
          }
        });
      }
    });
  });


  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allNotes, null, 2));
  console.log(`Consolidated ${allNotes.length} footnotes to ${OUTPUT_FILE}`);
}

consolidateNotes();
