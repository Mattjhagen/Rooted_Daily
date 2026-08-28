# OAuth Quick Start Guide

Get OAuth working in **under 30 minutes** with this streamlined guide.

## Step 1: Verify Dependencies (2 minutes)

Dependencies are already installed! ✅
- `expo-auth-session`
- `expo-crypto`
- `expo-web-browser`

## Step 2: Set Up Supabase (5 minutes)

### If you don't have a Supabase project yet:

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (choose a region close to your users)
3. Wait for project to provision (~2 minutes)
4. Go to Settings → API
5. Copy your **Project URL** and **anon public** key

### Add to .env:

Create a `.env` file (or copy from `.env.example`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ IMPORTANT:** Restart your Expo dev server after creating/editing `.env`

```bash
# Stop the current server (Ctrl+C)
npm start
```

## Step 3: Choose Your OAuth Provider

Pick ONE to start (you can add more later):

---

### Option A: YouVersion OAuth (Easiest - 15 minutes) ⭐ RECOMMENDED

**Best for:** Bible app users, fastest setup

1. Go to [YouVersion Developers](https://developers.youversion.com/)
2. Sign in with your YouVersion account (or create one)
3. Navigate to **Applications** → **Create New Application**
4. Fill in:
   - Name: `Rooted Daily`
   - Redirect URI: `deenbuddy://auth/callback`
   - Scope: `user:read`
5. Click **Create**
6. Copy your **Client ID** and **Client Secret**
7. Add to `.env`:

```env
EXPO_PUBLIC_YOUVERSION_CLIENT_ID=your-client-id
EXPO_PUBLIC_YOUVERSION_CLIENT_SECRET=your-client-secret
```

8. Restart Expo: `npm start`
9. **DONE!** Test by tapping "Continue with YouVersion"

---

### Option B: Google OAuth (Most Popular - 20 minutes)

**Best for:** Widest user reach, familiar flow

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted:
   - User Type: External
   - App name: Rooted Daily
   - Your email for support
6. Create **Web Application** client:
   - Name: `Rooted Daily Web`
   - Authorized redirect URIs: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
   - (Get YOUR-PROJECT-REF from your Supabase URL)
7. Copy **Client ID** and **Client Secret**
8. Go to **Supabase Dashboard** → Authentication → Providers → Google:
   - Enable Google
   - Paste Client ID
   - Paste Client Secret
   - Save
9. **DONE!** Test by tapping "Continue with Google"

---

### Option C: Apple OAuth (iOS Users - 30 minutes)

**Best for:** iOS-native experience, privacy-focused users

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. **Create App ID:**
   - Identifiers → + → App IDs
   - Bundle ID: `com.rooteddaily.bible`
   - Enable "Sign in with Apple"
4. **Create Services ID:**
   - Identifiers → + → Services IDs
   - Identifier: `com.rooteddaily.bible.auth`
   - Enable "Sign in with Apple" → Configure
   - Domain: `YOUR-PROJECT-REF.supabase.co`
   - Return URL: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
5. **Create Key:**
   - Keys → + 
   - Enable "Sign in with Apple"
   - Download .p8 file (⚠️ only downloadable once!)
   - Note the Key ID
6. **Get Team ID:**
   - Membership → Copy Team ID
7. **Configure in Supabase:**
   - Authentication → Providers → Apple
   - Enable Apple
   - Service ID: `com.rooteddaily.bible.auth`
   - Key ID: (from step 5)
   - Team ID: (from step 6)
   - Secret Key: (paste entire .p8 file contents)
   - Save
8. **DONE!** Test by tapping "Continue with Apple"

---

## Step 4: Test OAuth (5 minutes)

### ⚠️ CRITICAL: Must test on PHYSICAL device

Simulators don't work well with OAuth. Use a real iPhone or Android device.

1. Make sure dev server is running: `npm start`
2. Open app on physical device (scan QR code)
3. Navigate to login screen
4. Tap the OAuth button you configured (Google/Apple/YouVersion)
5. Browser should open with OAuth provider
6. Sign in with your account
7. App should redirect back and show home screen
8. **Success!** 🎉

### Verify it worked:

1. Go to Supabase Dashboard → Authentication → Users
2. You should see a new user entry
3. Check user metadata - should include provider info

---

## Troubleshooting

### "Network error" when testing OAuth

**Solution:**
1. Check `.env` has correct Supabase URL and key
2. Restart Expo server: `npm start`
3. Make sure Supabase project isn't paused (free tier pauses after 7 days)

### OAuth browser opens then closes immediately

**Solution:**
1. Are you testing on a physical device? (Simulators don't work)
2. Check `app.json` has `"scheme": "deenbuddy"` (✅ already there)
3. Try quitting the app completely and reopening

### "Redirect URI mismatch"

**Solution:**
1. For Google/Apple: Check callback URL exactly matches in provider console
2. Format: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
3. For YouVersion: Use `deenbuddy://auth/callback`

### "Invalid client_id" or "Invalid credentials"

**Solution:**
1. Double-check you copied Client ID correctly (no extra spaces)
2. For YouVersion: Verify Client Secret is correct
3. Try regenerating credentials in provider console

### Still stuck?

1. Check Supabase logs: Dashboard → Authentication → Logs
2. Check Expo console for error messages
3. Verify all environment variables are set correctly
4. Make sure you restarted Expo after changing `.env`

---

## Next Steps

### You're done with basic setup! Now you can:

1. **Add more providers** - Follow steps above for other OAuth options
2. **Test sign-out** - Tap sign out in settings, then sign in again
3. **Rebuild for TestFlight** - `eas build --platform ios --profile production`
4. **Customize the UI** - Edit `app/auth/login.tsx` to match your brand

### Optional Enhancements:

- Add user profile pictures from OAuth providers
- Sync YouVersion reading plans
- Show which provider user signed in with
- Add "Link another account" feature

---

## What You Built

✅ **Secure OAuth authentication** with industry-standard providers  
✅ **One-tap sign-in** for better user experience  
✅ **No password management** - let OAuth providers handle it  
✅ **Automatic session refresh** - Supabase keeps users logged in  
✅ **Production-ready** - works in TestFlight and App Store  

## Time Spent

- YouVersion: ~15 minutes ⚡
- Google: ~20 minutes
- Apple: ~30 minutes
- All three: ~60 minutes

## Files You Can Reference

- `OAUTH_SETUP.md` - Detailed setup for all three providers
- `OAUTH_CHECKLIST.md` - Step-by-step checklist format
- `OAUTH_SUMMARY.md` - Overview of what was built

---

**Need help?** Check the troubleshooting section above or review the detailed guides.

**Ready to ship?** Build a new version and submit to TestFlight:

```bash
eas build --platform ios --profile production
```

🎉 **Congratulations! Your app now has OAuth authentication!**
