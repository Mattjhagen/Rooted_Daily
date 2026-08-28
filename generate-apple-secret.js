const jwt = require('jsonwebtoken');
const fs = require('fs');

// Apple Developer credentials
const TEAM_ID = 'WZMXKCK98R';
const KEY_ID = '85C695552D';
const CLIENT_ID = 'com.rooteddaily.bible.auth';  // Services ID from Apple Developer

// IMPORTANT: Update this path to point to your .p8 file
// The file is named something like: AuthKey_85C695552D.p8
const P8_FILE_PATH = './AuthKey_85C695552D.p8';

// Check if .p8 file exists
if (!fs.existsSync(P8_FILE_PATH)) {
  console.error('ERROR: .p8 file not found at:', P8_FILE_PATH);
  console.error('\nPlease:');
  console.error('1. Place your .p8 file in this directory');
  console.error('2. Update P8_FILE_PATH in this script if the filename is different');
  process.exit(1);
}

// Read the private key
const privateKey = fs.readFileSync(P8_FILE_PATH, 'utf8');

// Generate the JWT (valid for 6 months)
const now = Math.floor(Date.now() / 1000);
const token = jwt.sign(
  {
    iss: TEAM_ID,
    iat: now,
    exp: now + (86400 * 180), // 180 days (6 months)
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID
  },
  privateKey,
  {
    algorithm: 'ES256',
    header: {
      alg: 'ES256',
      kid: KEY_ID
    }
  }
);

console.log('✅ Apple Client Secret (JWT) generated successfully!\n');
console.log('═══════════════════════════════════════════════════════════');
console.log(token);
console.log('═══════════════════════════════════════════════════════════\n');
console.log('📋 Copy the ENTIRE string above (everything between the lines)');
console.log('📝 Paste it into Supabase → Authentication → Providers → Apple → "Secret Key" field');
console.log('⏰ This token is valid for 6 months (expires:', new Date((now + 86400 * 180) * 1000).toLocaleDateString(), ')');
console.log('\n💡 After 6 months, run this script again to generate a new token.');
