# Generate Apple Client Secret (JWT)

Supabase requires a JWT (JSON Web Token) generated from your Apple .p8 private key.

Your credentials:
- **Team ID**: `WZMXKCK98R`
- **Key ID**: `85C695552D`
- **Services ID**: `com.rooteddaily.bible.auth`

---

## Quick Start

### Option 1: Node.js (Recommended)

1. **Place your .p8 file** in the project root directory
   - File should be named something like: `AuthKey_85C695552D.p8`
   
2. **Install dependencies**:
   ```bash
   npm install jsonwebtoken
   ```

3. **Run the script**:
   ```bash
   node generate-apple-secret.js
   ```

4. **Copy the JWT** that gets printed between the lines

5. **Paste into Supabase**:
   - Go to Supabase Dashboard
   - Authentication → Providers → Apple
   - Paste the JWT into the "Secret Key" field

---

### Option 2: Python

1. **Place your .p8 file** in the project root directory

2. **Install dependencies**:
   ```bash
   pip install pyjwt cryptography
   ```

3. **Run the script**:
   ```bash
   python generate-apple-secret.py
   ```

4. **Copy and paste the JWT** into Supabase (same as above)

---

## What the Scripts Do

Both scripts:
- Read your .p8 private key file
- Generate a JWT with:
  - Your Team ID: `WZMXKCK98R`
  - Your Key ID: `85C695552D`
  - Services ID: `com.rooteddaily.bible.auth`
  - 6-month expiration
- Print the JWT for you to copy

**Your private key never leaves your machine.**

---

## If Your .p8 File Has a Different Name

If your .p8 file is named differently:

**For Node.js** - Edit `generate-apple-secret.js` line 9:
```javascript
const P8_FILE_PATH = './YourActualFileName.p8';
```

**For Python** - Edit `generate-apple-secret.py` line 9:
```python
P8_FILE_PATH = './YourActualFileName.p8'
```

---

## What to Enter in Supabase

After running the script, you'll see output like:

```
✅ Apple Client Secret (JWT) generated successfully!

═══════════════════════════════════════════════════════════
eyJhbGciOiJFUzI1NiIsImtpZCI6Ijg1QzY5NTU1MkQifQ.eyJpc3MiOiJXWk1Y...
(very long string)
═══════════════════════════════════════════════════════════
```

**Copy the ENTIRE long string** (everything between the lines) and paste it into:

**Supabase Dashboard** → **Authentication** → **Providers** → **Apple** → **"Secret Key"** field

---

## Complete Supabase Apple Configuration

After generating the JWT, fill in these fields in Supabase:

| Field | Value |
|-------|-------|
| **Client ID** | `com.rooteddaily.bible.auth` |
| **Secret Key** | The JWT you just generated |
| **Callback URL** | (Pre-filled by Supabase) |

Then click **Save**.

---

## Token Expiration

The JWT is valid for **6 months**. After it expires:
1. Run the script again
2. Copy the new JWT
3. Update the "Secret Key" field in Supabase

**Mark your calendar**: Regenerate around **February 2027**

---

## Troubleshooting

### "Cannot find module 'jsonwebtoken'"
```bash
npm install jsonwebtoken
```

### "No module named 'jwt'" (Python)
```bash
pip install pyjwt cryptography
```

### ".p8 file not found"
- Make sure the .p8 file is in the same directory as the script
- Check the filename matches what's in the script
- Try using the full path: `/home/matt/Rooted_Daily/AuthKey_85C695552D.p8`

### "Invalid key format"
- Make sure you downloaded the .p8 file correctly from Apple
- The file should start with `-----BEGIN PRIVATE KEY-----`
- Don't edit or modify the .p8 file

---

## Security Notes

✅ **Safe**: Running these scripts locally  
✅ **Safe**: Your .p8 key never leaves your machine  
✅ **Safe**: The JWT is meant to be added to Supabase  

⚠️ **Never commit** your .p8 file to git  
⚠️ **Never share** your .p8 file with anyone  
⚠️ **Keep the .p8 file secure** - it can't be re-downloaded from Apple

---

## Next Step

After adding the JWT to Supabase and clicking Save:

Continue with **APPLE_SIGNIN_SETUP.md** → **Part 3: Verify Configuration**
