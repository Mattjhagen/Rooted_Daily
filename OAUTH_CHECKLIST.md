# OAuth Setup Checklist

Follow this checklist to add Google & Apple sign-in to Rooted Daily.

## ✅ Code Changes (DONE)

- [x] Installed `expo-auth-session` and `expo-crypto`
- [x] Added OAuth methods to AuthService
- [x] Updated login screen with Google/Apple/YouVersion buttons
- [x] Created auth callback route
- [x] Added Apple entitlements to app.json
- [x] Added YouVersion OAuth integration

## 📋 Configuration Steps (DO THESE NEXT)

### 1. Verify Supabase is Configured

- [ ] Check you have a `.env` file (copy from `.env.example` if needed)
- [ ] Verify these variables are set:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-key]
  ```
- [ ] Test basic connectivity to Supabase

### 2. Google OAuth Setup (20-30 minutes)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create OAuth 2.0 Client IDs:
  - [ ] iOS Client ID (Bundle: `com.rooteddaily.bible`)
  - [ ] Web Client ID (for Supabase callback)
- [ ] Get your Supabase callback URL from Dashboard
- [ ] Configure Google provider in Supabase:
  - [ ] Enable Google
  - [ ] Add Client ID
  - [ ] Add Client Secret
  - [ ] Add iOS Client ID to "Authorized Client IDs"
- [ ] Save configuration

### 3. Apple OAuth Setup (30-45 minutes)

- [ ] Go to [Apple Developer Console](https://developer.apple.com/account/)
- [ ] Create/verify App ID: `com.rooteddaily.bible`
- [ ] Enable "Sign in with Apple" capability
- [ ] Create Services ID: `com.rooteddaily.bible.auth`
- [ ] Configure Services ID with Supabase callback URL
- [ ] Create a Private Key (.p8 file)
- [ ] Download .p8 file (only downloadable once!)
- [ ] Note your Key ID and Team ID
- [ ] Configure Apple provider in Supabase:
  - [ ] Enable Apple
  - [ ] Add Service ID
  - [ ] Add Key ID
  - [ ] Add Team ID
  - [ ] Paste contents of .p8 file as Secret Key
- [ ] Save configuration

### 4. YouVersion OAuth Setup (15-20 minutes)

- [ ] Go to [YouVersion Developers](https://developers.youversion.com/)
- [ ] Sign in or create a YouVersion account
- [ ] Navigate to Applications
- [ ] Create new application:
  - [ ] Name: Rooted Daily
  - [ ] Add redirect URI: `rooted-daily://auth/callback`
  - [ ] Select scope: `user:read`
- [ ] Copy Client ID and Client Secret
- [ ] Add to .env file:
  - [ ] `EXPO_PUBLIC_YOUVERSION_CLIENT_ID`
  - [ ] `EXPO_PUBLIC_YOUVERSION_CLIENT_SECRET`
- [ ] Save configuration

### 5. Test Locally

- [ ] Restart Expo dev server: `npm start`
- [ ] Test on a physical iOS device (simulators don't work well for OAuth)
- [ ] Try "Continue with Google"
- [ ] Try "Continue with Apple"
- [ ] Try "Continue with YouVersion"
- [ ] Verify successful sign-in redirects to home screen
- [ ] Check Supabase Dashboard > Authentication > Users to see new users

### 6. Build for Production

- [ ] Increment version in app.json
- [ ] Build iOS: `eas build --platform ios --profile production`
- [ ] Build Android: `eas build --platform android --profile production`
- [ ] Submit to TestFlight/Play Store
- [ ] Test OAuth in production build

## 🐛 Troubleshooting

If you encounter issues, check:

1. **Network Error on Sign-In**
   - Verify .env has correct Supabase credentials
   - Check Supabase project is active (not paused)
   - Restart Expo dev server after changing .env

2. **"Redirect URI mismatch"**
   - Double-check callback URLs match in all three places:
     - Google Cloud Console
     - Apple Services ID
     - Supabase Providers
   - Format: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`

3. **"Invalid client_id"**
   - Verify Client IDs are copy-pasted correctly
   - For Google: Use the Web Client ID in Supabase, not iOS
   - For Apple: Use the Services ID, not the Bundle ID

4. **OAuth window closes immediately**
   - Make sure app.json has `"scheme": "rooted-daily"`
   - Test on a physical device, not simulator
   - Check for console errors

## 📚 Reference Documentation

- Full setup guide: See `OAUTH_SETUP.md`
- Supabase docs: https://supabase.com/docs/guides/auth/social-login
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Apple Sign-In: https://developer.apple.com/sign-in-with-apple/

## 🎯 Quick Start

The fastest way to get started:

1. **Copy .env.example to .env and fill in your Supabase credentials**
2. **Follow OAUTH_SETUP.md for detailed step-by-step instructions**
3. **Test on a physical device**
4. **Check "Troubleshooting" section if you hit issues**

---

Need help? Check the logs in Supabase Dashboard > Authentication > Logs
