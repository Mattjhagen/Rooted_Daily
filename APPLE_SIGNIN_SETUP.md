# Apple Sign-In Setup Guide - EXACT VALUES

This guide uses the EXACT values from your Rooted Daily implementation.

---

## 📋 Values You Need FROM Rooted Daily Code

These values are already configured in your app:

| Value | Location | Actual Value |
|-------|----------|--------------|
| **Bundle ID** | `app.json` line 18 | `com.rooteddaily.bible` |
| **URL Scheme** | `app.json` line 8 | `rooted-daily` |
| **Redirect URI** | Dynamically generated | `rooted-daily://auth/callback` |
| **Apple Entitlement** | `app.json` lines 26-30 | ✅ Already configured |

**Copy FROM Rooted**: None (all values already in code)  
**Copy INTO Rooted**: Nothing (Apple credentials go in Supabase Dashboard only)

---

## 🔐 Security Verification

✅ **Client Secret**: NOT in mobile app (handled by Supabase server-side)  
✅ **Token Storage**: AsyncStorage via Supabase SDK (secure)  
✅ **PKCE**: Handled by Supabase server-side  
✅ **Token Refresh**: Automatic via Supabase  
✅ **Logout**: `supabase.auth.signOut()` clears AsyncStorage

---

## 📱 Prerequisites

1. **Apple Developer Account** ($99/year) - Required
2. **Supabase Project** - Get credentials first:
   - Go to [supabase.com](https://supabase.com)
   - Open your project
   - Settings → API
   - Copy **Project URL** (format: `https://abcdefgh.supabase.co`)
   - Copy **anon public** key

3. **Add Supabase to .env**:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```

4. **Restart Expo**: `npm start`

---

## 🍎 Part 1: Apple Developer Console Configuration

### Step 1: Get Your Team ID

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Sign in with your Apple Developer account
3. Click **Membership** in left sidebar
4. **Copy your Team ID** (format: `ABC1234DEF`)
5. Save it somewhere - you'll need it later

---

### Step 2: Create or Verify App ID

1. Navigate to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** in left sidebar
3. Look for an App ID with Bundle ID: `com.rooteddaily.bible`

**If it exists**:
- Click on it
- Verify **"Sign in with Apple"** is checked under Capabilities
- If not checked, enable it and click **Save**

**If it doesn't exist**:
1. Click **+** button to create new identifier
2. Select **App IDs** → Continue
3. Select **App** → Continue
4. Fill in:
   - **Description**: `Rooted Daily`
   - **Bundle ID**: Select "Explicit"
   - **Enter Bundle ID**: `com.rooteddaily.bible` (EXACT - from app.json)
5. Scroll down to **Capabilities**
6. Check ✅ **Sign in with Apple**
7. Click **Continue** → **Register**

---

### Step 3: Create Services ID

This is the identifier Supabase will use.

1. Still in **Identifiers**, click **+** button
2. Select **Services IDs** → Continue
3. Fill in:
   - **Description**: `Rooted Daily Auth Service`
   - **Identifier**: `com.rooteddaily.bible.auth`
     - ⚠️ Must be DIFFERENT from Bundle ID
     - ⚠️ This is what you'll enter in Supabase later
4. Check ✅ **Sign in with Apple**
5. Click **Configure** next to "Sign in with Apple"

**In the configuration dialog**:
1. **Primary App ID**: Select `Rooted Daily (com.rooteddaily.bible)`
2. **Website URLs**:
   - Click **+** next to "Website URLs"
   - **Domains and Subdomains**: Enter ONLY the domain part of your Supabase URL
     - Example: If your Supabase URL is `https://abcdefgh.supabase.co`
     - Enter: `abcdefgh.supabase.co` (NO https://, NO trailing slash)
   - **Return URLs**: Click **+** and enter the FULL callback URL
     - Format: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
     - Example: `https://abcdefgh.supabase.co/auth/v1/callback`
     - ⚠️ Replace YOUR-PROJECT-REF with your actual project reference
3. Click **Next** → **Done** → **Continue** → **Register**

**Save this value**: `com.rooteddaily.bible.auth` (you'll enter it in Supabase)

---

### Step 4: Create Private Key

1. Click **Keys** in left sidebar
2. Click **+** button to create new key
3. Fill in:
   - **Key Name**: `Rooted Daily Sign in with Apple Key`
4. Check ✅ **Sign in with Apple**
5. Click **Configure** next to "Sign in with Apple"
6. **Primary App ID**: Select `Rooted Daily (com.rooteddaily.bible)`
7. Click **Save** → **Continue** → **Register**

**CRITICAL - Download the Key**:
1. Click **Download** (you can only download ONCE - there's no second chance!)
2. Save the `.p8` file somewhere safe
3. **Note the Key ID** shown on the page (format: `AB12CD34EF`)
4. Click **Done**

**Save these values**:
- **Key ID**: (example: `AB12CD34EF`)
- **P8 File Contents**: Keep the downloaded file safe

---

## 🗄️ Part 2: Supabase Configuration

### Step 5: Configure Apple Provider in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Scroll to find **Apple**
4. Click on Apple to expand configuration

**Enter these exact values**:

| Field | Value | Where It's From |
|-------|-------|-----------------|
| **Enabled** | Toggle ON | - |
| **Service ID** | `com.rooteddaily.bible.auth` | From Apple Step 3 |
| **Authorized Client IDs** | `com.rooteddaily.bible` | Your app's Bundle ID |
| **Team ID** | Your team ID | From Apple Step 1 |
| **Key ID** | Your key ID | From Apple Step 4 |
| **Secret Key (Private Key)** | Contents of .p8 file | From Apple Step 4 |

**How to paste the Secret Key**:
1. Open the `.p8` file in a text editor
2. Copy the ENTIRE contents including:
   ```
   -----BEGIN PRIVATE KEY-----
   (many lines of random characters)
   -----END PRIVATE KEY-----
   ```
3. Paste ALL of it into the "Secret Key" field in Supabase

**Click Save**

---

## 🔍 Part 3: Verify Configuration

### In Supabase Dashboard:

1. Still in **Authentication** → **Providers** → **Apple**
2. Look for the "Callback URL (for OAuth)" field
3. It should show: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
4. **Copy this URL**

### Verify in Apple Developer Console:

1. Go back to Apple Developer Console
2. **Identifiers** → Click on `com.rooteddaily.bible.auth` (Services ID)
3. Click **Configure** next to "Sign in with Apple"
4. Check that the **Return URL** matches the Supabase callback URL EXACTLY

If they don't match:
- Update Apple to match Supabase
- Save changes

---

## 📱 Part 4: Test on Physical Device

### ⚠️ CRITICAL: Must test on PHYSICAL iOS device

Apple Sign-In does NOT work reliably in Simulator.

### Test Procedure:

1. **Build a development version** (if not already done):
   ```bash
   npm start
   # Scan QR code with iPhone
   ```

2. **Navigate to login screen** in the app

3. **Tap "Continue with Apple"**

4. **Expected flow**:
   - Safari opens with Apple authentication page
   - You see "Sign in with Apple" dialog
   - If first time: Asked to authorize "Rooted Daily"
   - You can choose to hide/share your email
   - Tap "Continue"
   - Safari redirects back to app
   - App shows home screen
   - ✅ Success!

5. **Verify in Supabase**:
   - Go to Supabase Dashboard
   - **Authentication** → **Users**
   - You should see a new user
   - Click on the user
   - Check **Identities** tab - should show `apple` provider
   - Check **Raw User Meta Data** - should have Apple user info

---

## 🧪 Test Logout and Re-login

### Test 1: Logout Works

1. In app, go to **Settings**
2. Tap **Sign Out**
3. Should return to login screen
4. **Verify**: Supabase session cleared (can't access protected routes)

### Test 2: Re-login Works

1. Tap "Continue with Apple" again
2. Should sign in immediately (Apple remembers your choice)
3. Should show same user account (not create new one)

**Verify in Supabase**:
- Still only ONE user with your Apple email
- No duplicate accounts

---

## 🔗 Test Account Linking (CRITICAL)

### Scenario: Email/Password User Later Uses Apple

**Test this to understand account behavior**:

1. **Create account with email/password**:
   - Tap "Sign Up" on login screen
   - Enter email: `your.email@example.com`
   - Enter password
   - Sign up and verify

2. **Sign out**

3. **Sign in with Apple using SAME email**:
   - Tap "Continue with Apple"
   - Make sure you use the Apple ID with `your.email@example.com`
   - Complete sign-in

4. **Check Supabase Dashboard** → Authentication → Users:

**QUESTION**: Do you see one user or two users?

**If ONE user**:
- ✅ Supabase linked the Apple identity to existing user
- User's journal entries should be visible
- Check user's **Identities** tab - should show both `email` and `apple`

**If TWO users**:
- ❌ Problem: Duplicate accounts
- User's data is split
- Need to configure Supabase account linking settings

**Document the behavior here**:
- [ ] One user (identities linked) ✅
- [ ] Two users (duplicates created) ❌

---

## 🐛 Troubleshooting

### "Invalid_request" or "redirect_uri_mismatch"

**Cause**: Return URL in Apple doesn't match Supabase callback URL

**Fix**:
1. Check Supabase callback URL: `https://YOUR-REF.supabase.co/auth/v1/callback`
2. Check Apple Services ID → Configure → Return URLs
3. They must match EXACTLY (including https://, no trailing slash)
4. Update Apple if needed
5. Wait 5-10 minutes for Apple changes to propagate

---

### OAuth Window Opens Then Closes Immediately

**Cause**: URL scheme mismatch or simulator issue

**Fix**:
1. Verify testing on **physical device** (not simulator)
2. Check `app.json` has `"scheme": "rooted-daily"` (line 8) ✅
3. Rebuild the app: `npm start` (clear cache if needed)
4. Force quit app completely and reopen

---

### "Unable to Verify" or Certificate Error

**Cause**: P8 key file or Key ID incorrect

**Fix**:
1. Re-download the P8 file if possible (if not, create new key)
2. Copy entire contents INCLUDING begin/end lines
3. Verify Key ID matches exactly (case-sensitive)
4. Verify Team ID matches exactly

---

### Apple Sign-In Button Does Nothing

**Cause**: Supabase credentials missing from .env

**Fix**:
1. Check `.env` file exists in project root
2. Verify it has `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Restart Expo: `npm start`
4. Check console for errors

---

### User Gets "Network Error"

**Cause**: Supabase project paused or unreachable

**Fix**:
1. Check Supabase Dashboard - project not paused
2. Test Supabase connection: `curl https://YOUR-REF.supabase.co`
3. Check device has internet connection
4. Try on different network (WiFi vs cellular)

---

## ✅ Success Criteria

Before moving to Google OAuth, verify:

- [x] Apple button appears on login screen
- [x] Tapping button opens Safari with Apple auth
- [x] After authenticating, app redirects back successfully
- [x] User is logged in and sees home screen
- [x] Supabase shows new user with `apple` identity
- [x] Logout works and clears session
- [x] Re-login works without creating duplicate
- [x] Account linking behavior documented (one user vs two users)

---

## 📝 Next Steps

After Apple Sign-In is working:
1. Document account linking behavior (one user or two?)
2. Test with different Apple IDs
3. Proceed to Google OAuth setup

**Do not proceed to Google until Apple is fully working and tested.**
