const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/bibleFull.json', 'utf8'));
console.log('First book keys:', Object.keys(data.books[0]));
console.log('First book sample:', JSON.stringify(data.books[0]).substring(0, 100));
