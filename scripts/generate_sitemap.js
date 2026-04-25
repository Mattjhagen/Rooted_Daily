const fs = require('fs');
const path = require('path');

const bibleDataPath = path.join(__dirname, '..', 'src', 'data', 'bibleFull.json');
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');

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

function generateSitemap() {
  const data = JSON.parse(fs.readFileSync(bibleDataPath, 'utf8'));
  const urls = [
    'https://rootedapp.space/',
    'https://rootedapp.space/support/',
    'https://rootedapp.space/privacy/',
    'https://rootedapp.space/bible/'
  ];

  for (const bookData of data.books) {
    const slug = mapping[bookData.abbrev];
    if (!slug) continue;

    urls.push(`https://rootedapp.space/bible/${slug}/`);
    bookData.chapters.forEach((_, i) => {
      urls.push(`https://rootedapp.space/bible/${slug}/${i + 1}/`);
    });
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>2026-04-25</lastmod>
    <priority>${url.split('/').length <= 4 ? '1.00' : (url.split('/').length <= 5 ? '0.80' : '0.60')}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(`Sitemap generated with ${urls.length} URLs.`);
}

generateSitemap();
