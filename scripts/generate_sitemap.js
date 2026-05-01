const fs = require('fs');
const path = require('path');

const bibleDataPath = path.join(__dirname, '..', 'src', 'data', 'bibleFull.json');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
const sitemapNotesPath = path.join(__dirname, '..', 'sitemap-notes.xml');
const lltDataDir = path.join(__dirname, '..', 'json', 'llt');

const mapping = {
  'gn': 'genesis', 'ex': 'exodus', 'lv': 'leviticus', 'nm': 'numbers', 'dt': 'deuteronomy',
  'js': 'joshua', 'jud': 'judges', 'rt': 'ruth', '1sm': '1-samuel', '2sm': '2-samuel',
  '1kgs': '1-kings', '2kgs': '2-kings', '1ch': '1-chronicles', '2ch': '2-chronicles',
  'ezr': 'ezra', 'ne': 'nehemiah', 'et': 'esther', 'job': 'job', 'ps': 'psalms',
  'prv': 'proverbs', 'ec': 'ecclesiastes', 'so': 'song-of-solomon', 'is': 'isaiah',
  'jr': 'jeremiah', 'lm': 'lamentations', 'ez': 'ezekiel', 'dn': 'daniel',
  'ho': 'hosea', 'jl': 'joel', 'am': 'amos', 'ob': 'obadiah', 'jn': 'jonah',
  'mi': 'micah', 'na': 'nahum', 'hk': 'habakkuk', 'zp': 'zephaniah', 'hg': 'haggai',
  'zc': 'zechariah', 'ml': 'malachi', 'mt': 'matthew', 'mk': 'mark', 'lk': 'luke',
  'jo': 'john', 'act': 'acts', 'rm': 'romans', '1co': '1-corinthians', '2co': '2-corinthians',
  'gl': 'galatians', 'eph': 'ephesians', 'ph': 'philippians', 'cl': 'colossians',
  '1ts': '1-thessalonians', '2ts': '2-thessalonians', '1tm': '1-timothy', '2tm': '2-timothy',
  'tt': 'titus', 'phm': 'philemon', 'hb': 'hebrews', 'jm': 'james', '1pe': '1-peter',
  '2pe': '2-peter', '1jo': '1-john', '2jo': '2-john', '3jo': '3-john', 'jd': 'jude',
  're': 'revelation'
};

const DOMAIN = 'https://rootedapp.space';
const today = new Date().toISOString().split('T')[0];

function generateSitemaps() {
  const data = JSON.parse(fs.readFileSync(bibleDataPath, 'utf8'));
  const allUrls = [
    DOMAIN + '/',
    DOMAIN + '/support/',
    DOMAIN + '/privacy/',
    DOMAIN + '/bible/'
  ];

  const notesUrls = [];

  for (const bookData of data.books) {
    const slug = mapping[bookData.abbrev];
    if (!slug) continue;

    const bookUrl = `${DOMAIN}/bible/${slug}/`;
    allUrls.push(bookUrl);

    bookData.chapters.forEach((_, i) => {
      const chapterNum = i + 1;
      const chapterUrl = `${DOMAIN}/bible/${slug}/${chapterNum}/`;
      allUrls.push(chapterUrl);

      // Check if this chapter has LLT notes
      const lltFilePath = path.join(lltDataDir, slug, `${chapterNum}.json`);
      if (fs.existsSync(lltFilePath)) {
        try {
          const lltData = JSON.parse(fs.readFileSync(lltFilePath, 'utf8'));
          const hasNotes = lltData.footnotes && lltData.footnotes.some(fn => fn.content && fn.content.trim().length > 0);
          if (hasNotes) {
            notesUrls.push(chapterUrl);
          }
        } catch (e) {
          console.warn(`Error reading LLT data for ${slug} ${chapterNum}:`, e.message);
        }
      }
    });
  }

  // Generate sitemap.xml
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <priority>${url.split('/').length <= 4 ? '1.00' : (url.split('/').length <= 5 ? '0.80' : '0.60')}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(`sitemap.xml generated with ${allUrls.length} URLs.`);

  // Generate sitemap-notes.xml
  const notesSitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${notesUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.70</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(sitemapNotesPath, notesSitemapContent);
  console.log(`sitemap-notes.xml generated with ${notesUrls.length} URLs.`);
}

generateSitemaps();

