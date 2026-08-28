import jwt
import time
import os
from datetime import datetime

# Apple Developer credentials
TEAM_ID = 'WZMXKCK98R'
KEY_ID = '85C695552D'
CLIENT_ID = 'com.rooteddaily.bible.auth'  # Services ID from Apple Developer

# IMPORTANT: Update this path to point to your .p8 file
# The file is named something like: AuthKey_85C695552D.p8
P8_FILE_PATH = './AuthKey_85C695552D.p8'

# Check if .p8 file exists
if not os.path.exists(P8_FILE_PATH):
    print('ERROR: .p8 file not found at:', P8_FILE_PATH)
    print('\nPlease:')
    print('1. Place your .p8 file in this directory')
    print('2. Update P8_FILE_PATH in this script if the filename is different')
    exit(1)

# Read the private key
with open(P8_FILE_PATH, 'r') as f:
    private_key = f.read()

# Generate the JWT
now = int(time.time())
expiry = now + (86400 * 180)  # 180 days (6 months)

headers = {
    'alg': 'ES256',
    'kid': KEY_ID
}

payload = {
    'iss': TEAM_ID,
    'iat': now,
    'exp': expiry,
    'aud': 'https://appleid.apple.com',
    'sub': CLIENT_ID
}

token = jwt.encode(payload, private_key, algorithm='ES256', headers=headers)

# Handle both PyJWT v1 and v2
if isinstance(token, bytes):
    token = token.decode('utf-8')

print('✅ Apple Client Secret (JWT) generated successfully!\n')
print('═══════════════════════════════════════════════════════════')
print(token)
print('═══════════════════════════════════════════════════════════\n')
print('📋 Copy the ENTIRE string above (everything between the lines)')
print('📝 Paste it into Supabase → Authentication → Providers → Apple → "Secret Key" field')
print('⏰ This token is valid for 6 months (expires:', datetime.fromtimestamp(expiry).strftime('%Y-%m-%d'), ')')
print('\n💡 After 6 months, run this script again to generate a new token.')
