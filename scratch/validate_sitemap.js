const fs = require('fs');
const xml2js = require('xml2js');

const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

xml2js.parseString(sitemap, (err, result) => {
  if (err) {
    console.error('XML Parsing Error:', err);
  } else {
    console.log('Sitemap is valid XML. URL count:', result.urlset.url.length);
  }
});
