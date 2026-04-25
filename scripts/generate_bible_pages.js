const fs = require('fs');
const path = require('path');

const bibleDataPath = path.join(__dirname, '..', 'src', 'data', 'bibleFull.json');
const bibleOutDir = path.join(__dirname, '..', 'bible');

const mapping = {
  'gn': { name: 'Genesis', slug: 'genesis' },
  'ex': { name: 'Exodus', slug: 'exodus' },
  'lv': { name: 'Leviticus', slug: 'leviticus' },
  'nm': { name: 'Numbers', slug: 'numbers' },
  'dt': { name: 'Deuteronomy', slug: 'deuteronomy' },
  'js': { name: 'Joshua', slug: 'joshua' },
  'jud': { name: 'Judges', slug: 'judges' },
  'rt': { name: 'Ruth', slug: 'ruth' },
  '1sm': { name: '1 Samuel', slug: '1-samuel' },
  '2sm': { name: '2 Samuel', slug: '2-samuel' },
  '1kgs': { name: '1 Kings', slug: '1-kings' },
  '2kgs': { name: '2 Kings', slug: '2-kings' },
  '1ch': { name: '1 Chronicles', slug: '1-chronicles' },
  '2ch': { name: '2 Chronicles', slug: '2-chronicles' },
  'ezr': { name: 'Ezra', slug: 'ezra' },
  'ne': { name: 'Nehemiah', slug: 'nehemiah' },
  'et': { name: 'Esther', slug: 'esther' },
  'job': { name: 'Job', slug: 'job' },
  'ps': { name: 'Psalms', slug: 'psalms' },
  'prv': { name: 'Proverbs', slug: 'proverbs' },
  'ec': { name: 'Ecclesiastes', slug: 'ecclesiastes' },
  'so': { name: 'Song of Solomon', slug: 'song-of-solomon' },
  'is': { name: 'Isaiah', slug: 'isaiah' },
  'jr': { name: 'Jeremiah', slug: 'jeremiah' },
  'lm': { name: 'Lamentations', slug: 'lamentations' },
  'ez': { name: 'Ezekiel', slug: 'ezekiel' },
  'dn': { name: 'Daniel', slug: 'daniel' },
  'ho': { name: 'Hosea', slug: 'hosea' },
  'jl': { name: 'Joel', slug: 'joel' },
  'am': { name: 'Amos', slug: 'amos' },
  'ob': { name: 'Obadiah', slug: 'obadiah' },
  'jn': { name: 'Jonah', slug: 'jonah' },
  'mi': { name: 'Micah', slug: 'micah' },
  'na': { name: 'Nahum', slug: 'nahum' },
  'hk': { name: 'Habakkuk', slug: 'habakkuk' },
  'zp': { name: 'Zephaniah', slug: 'zephaniah' },
  'hg': { name: 'Haggai', slug: 'haggai' },
  'zc': { name: 'Zechariah', slug: 'zechariah' },
  'ml': { name: 'Malachi', slug: 'malachi' },
  'mt': { name: 'Matthew', slug: 'matthew' },
  'mk': { name: 'Mark', slug: 'mark' },
  'lk': { name: 'Luke', slug: 'luke' },
  'jo': { name: 'John', slug: 'john' },
  'act': { name: 'Acts', slug: 'acts' },
  'rm': { name: 'Romans', slug: 'romans' },
  '1co': { name: '1 Corinthians', slug: '1-corinthians' },
  '2co': { name: '2 Corinthians', slug: '2-corinthians' },
  'gl': { name: 'Galatians', slug: 'galatians' },
  'eph': { name: 'Ephesians', slug: 'ephesians' },
  'ph': { name: 'Philippians', slug: 'philippians' },
  'cl': { name: 'Colossians', slug: 'colossians' },
  '1ts': { name: '1 Thessalonians', slug: '1-thessalonians' },
  '2ts': { name: '2 Thessalonians', slug: '2-thessalonians' },
  '1tm': { name: '1 Timothy', slug: '1-timothy' },
  '2tm': { name: '2 Timothy', slug: '2-timothy' },
  'tt': { name: 'Titus', slug: 'titus' },
  'phm': { name: 'Philemon', slug: 'philemon' },
  'hb': { name: 'Hebrews', slug: 'hebrews' },
  'jm': { name: 'James', slug: 'james' },
  '1pe': { name: '1 Peter', slug: '1-peter' },
  '2pe': { name: '2 Peter', slug: '2-peter' },
  '1jo': { name: '1 John', slug: '1-john' },
  '2jo': { name: '2 John', slug: '2-john' },
  '3jo': { name: '3 John', slug: '3-john' },
  'jd': { name: 'Jude', slug: 'jude' },
  're': { name: 'Revelation', slug: 'revelation' }
};

const googleTag = `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-HSEJQQEFLJ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-HSEJQQEFLJ');
</script>
`;

function getTemplate(title, description, content, relativePathToRoot) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Rooted Daily</title>
    <meta name="description" content="${description}">
    ${googleTag}
    <link rel="stylesheet" href="${relativePathToRoot}style.css">
    <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <header>
            <div class="logo-container">
                <a href="/" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 1rem;">
                    <img src="https://rootedapp.space/logo_dark_light.png" alt="Rooted Icon" class="logo-img">
                    <span class="logo-text">Rooted Daily</span>
                </a>
            </div>
            <nav>
                <a href="/bible/" class="nav-link" style="margin-right: 1.5rem;">Bible Index</a>
                <a href="#" id="signin-btn" class="nav-link">Sign In</a>
            </nav>
        </header>

        <main class="bible-content">
            ${content}
        </main>

        <footer>
            <p>&copy; 2026 PacMac Mobile LLC. All rights reserved.</p>
        </footer>
    </div>

    <!-- Interactive Elements -->
    <div id="highlight-menu">
        <button id="btn-highlight" class="menu-btn">🖍️ Highlight</button>
        <button id="btn-reflect" class="menu-btn">🪴 Reflect</button>
    </div>

    <div id="ai-bubble" class="ai-bubble">
        <img src="https://rootedapp.space/logo_dark_light.png" alt="AI">
    </div>

    <div id="ai-chat-window" class="ai-chat-window">
        <div class="ai-chat-header">
            <span>Rooted AI</span>
            <button id="close-chat" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
        </div>
        <div id="chat-messages" class="ai-chat-messages">
            <div class="message ai">Hi! I'm Rooted. How can I help you with your reading today?</div>
        </div>
        <form id="chat-form" class="ai-chat-input">
            <input type="text" id="chat-input" placeholder="Ask Rooted...">
            <button type="submit">Send</button>
        </form>
    </div>

    <div id="auth-modal" class="modal-overlay">
        <div class="modal-content">
            <button id="close-auth" class="close-modal">✕</button>
            <h2>Join Rooted Daily</h2>
            <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">Sign in to save your highlights and journal entries across devices.</p>
            <form id="auth-form">
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="email" required placeholder="you@example.com">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="password" required placeholder="••••••••">
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn primary" style="width: 100%;">Sign In</button>
                    <button type="button" id="create-account-btn" class="btn" style="width: 100%; background: transparent; border: 1px solid var(--glass-border); color: white;">Create Account</button>
                </div>
            </form>
        </div>
    </div>

    <script src="${relativePathToRoot}bible-reader.js"></script>
</body>
</html>`;
}

async function generate() {
  const data = JSON.parse(fs.readFileSync(bibleDataPath, 'utf8'));
  let totalPages = 0;

  for (const bookData of data.books) {
    const bookInfo = mapping[bookData.abbrev];
    if (!bookInfo) {
      console.warn(`No mapping for ${bookData.abbrev}`);
      continue;
    }

    const bookDir = path.join(bibleOutDir, bookInfo.slug);
    if (!fs.existsSync(bookDir)) fs.mkdirSync(bookDir, { recursive: true });

    // Generate Book Index (Chapter List)
    const chapterList = bookData.chapters.map((_, i) => 
      `<a href="/bible/${bookInfo.slug}/${i + 1}/" class="chapter-link">${i + 1}</a>`
    ).join('');

    const bookIndexContent = `
      <h1>${bookInfo.name}</h1>
      <p>Select a chapter to read.</p>
      <div class="bible-grid">
        ${chapterList}
      </div>
    `;

    fs.writeFileSync(
      path.join(bookDir, 'index.html'),
      getTemplate(bookInfo.name, `Read the book of ${bookInfo.name} on Rooted Daily.`, bookIndexContent, '../../')
    );
    totalPages++;

    // Generate Chapter Pages
    bookData.chapters.forEach((chapter, i) => {
      const chapterNum = i + 1;
      const chapterDir = path.join(bookDir, chapterNum.toString());
      if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir, { recursive: true });

      const versesContent = chapter.map((verse, j) => 
        `<div class="verse"><span class="verse-num">${j + 1}</span>${verse}</div>`
      ).join('');

      const prevLink = chapterNum > 1 ? `<a href="/bible/${bookInfo.slug}/${chapterNum - 1}/" class="nav-btn">← Chapter ${chapterNum - 1}</a>` : '<span></span>';
      const nextLink = chapterNum < bookData.chapters.length ? `<a href="/bible/${bookInfo.slug}/${chapterNum + 1}/" class="nav-btn">Chapter ${chapterNum + 1} →</a>` : '<span></span>';

      const chapterContent = `
        <a href="/bible/${bookInfo.slug}/" class="nav-btn">← Back to ${bookInfo.name}</a>
        <h1 style="margin-top: 1rem;">${bookInfo.name} ${chapterNum}</h1>
        <div style="margin-top: 2rem;">
          ${versesContent}
        </div>
        <div class="chapter-nav">
          ${prevLink}
          ${nextLink}
        </div>
      `;

      fs.writeFileSync(
        path.join(chapterDir, 'index.html'),
        getTemplate(
          `${bookInfo.name} ${chapterNum}`,
          `Read ${bookInfo.name} Chapter ${chapterNum}. Experience the Bible with audio narration and AI reflections on Rooted Daily.`,
          chapterContent,
          '../../../'
        )
      );
      totalPages++;
    });
  }

  console.log(`Generated ${totalPages} pages.`);
}

generate().catch(console.error);
