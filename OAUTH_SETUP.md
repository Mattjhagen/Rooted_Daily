# OAuth Setup Guide for Rooted Daily

This guide walks you through setting up Google, Apple, and YouVersion sign-in for your app.

## Prerequisites

1. A Supabase account and project ([supabase.com](https://supabase.com))
2. Google Cloud Console account (for Google Sign-In)
3. Apple Developer account (for Apple Sign-In)
4. YouVersion Developer account (for YouVersion Sign-In)

---

## Part 1: Google Sign-In Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Rooted Daily
   - User support email: your email
   - Developer contact: your email
   - Add scopes: `email`, `profile`
   - Save and continue

### Step 2: Create OAuth Client IDs

You need to create TWO client IDs:

#### A. iOS Client ID
1. Application type: **iOS**
2. Name: Rooted Daily iOS
3. Bundle ID: `com.rooteddaily.bible`
4. Save and copy the **Client ID**

#### B. Web Client ID (for Android & Expo)
1. Application type: **Web application**
2. Name: Rooted Daily Web
3. Authorized redirect URIs:
   - Add your Supabase callback: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Find your project ref in Supabase Settings > API > Project URL
4. Save and copy the **Client ID** and **Client Secret**

### Step 3: Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click to configure:
   - **Enabled**: Toggle ON
   - **Client ID**: Paste the Web Client ID
   - **Client Secret**: Paste the Web Client Secret
   - **Authorized Client IDs**: Add the iOS Client ID here (optional but recommended)
   - **Redirect URL**: Copy this URL (you'll need it for app.json)
4. Save

---

## Part 2: Apple Sign-In Setup

### Step 1: Configure in Apple Developer Console

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**

#### A. Create an App ID
1. Click **Identifiers** > **+** (Add)
2. Select **App IDs** > Continue
3. Description: Rooted Daily
4. Bundle ID: `com.rooteddaily.bible`
5. Capabilities: Enable **Sign in with Apple**
6. Register

#### B. Create a Services ID
1. Click **Identifiers** > **+** (Add)
2. Select **Services IDs** > Continue
3. Description: Rooted Daily Auth
4. Identifier: `com.rooteddaily.bible.auth` (must be different from Bundle ID)
5. Enable **Sign in with Apple** > Configure
6. Primary App ID: Select your app ID from above
7. Website URLs:
   - Domains: `[YOUR-PROJECT-REF].supabase.co`
   - Return URLs: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
8. Save and Continue > Register

#### C. Create a Private Key
1. Click **Keys** > **+** (Add)
2. Key Name: Rooted Daily Apple Auth
3. Enable **Sign in with Apple** > Configure
4. Primary App ID: Select your app ID
5. Save
6. Register
7. **Download the .p8 file** (you can only download once!)
8. Note the **Key ID** shown

#### D. Get Your Team ID
1. Go to **Membership** in the left sidebar
2. Copy your **Team ID**

### Step 2: Configure in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Apple** and click to configure:
   - **Enabled**: Toggle ON
   - **Service ID**: `com.rooteddaily.bible.auth`
   - **Key ID**: Paste the Key ID from above
   - **Team ID**: Paste your Team ID
   - **Secret Key**: Open the .p8 file and paste the ENTIRE contents (including BEGIN/END lines)
   - **Redirect URL**: Copy this URL
4. Save

---

## Part 3: YouVersion Sign-In Setup

### Step 1: Register for YouVersion Developer Access

1. Go to [YouVersion Developers](https://developers.youversion.com/)
2. Click **Get Started** or **Sign In**
3. Sign in with your YouVersion account or create one
4. Navigate to **Data Exchange API**
5. Apply for API access if you haven't already

### Step 2: Create OAuth Application

1. In the YouVersion Developer Portal, go to **Applications**
2. Click **Create New Application**
3. Fill in the application details:
   - **Name**: Rooted Daily
   - **Description**: A daily devotional and Bible study app
   - **Website**: Your app website or GitHub repo
   - **Redirect URIs**: 
     - Add: `rooted-daily://auth/callback`
     - For testing: `exp://localhost:8081/--/auth/callback`
4. **Scopes**: Select `user:read` (to get user profile info)
5. Save the application

### Step 3: Get OAuth Credentials

After creating the application:
1. You'll see your **Client ID** - copy this
2. Click **Show Client Secret** and copy the **Client Secret**
3. Save these securely - you'll need them for .env

### Step 4: Add to .env File

Add your YouVersion OAuth credentials to your `.env` file:

```env
EXPO_PUBLIC_YOUVERSION_CLIENT_ID=your_client_id_here
EXPO_PUBLIC_YOUVERSION_CLIENT_SECRET=your_client_secret_here
```

### Step 5: Test YouVersion OAuth

1. Restart your Expo dev server
2. Open the app on a physical device
3. Tap "Continue with YouVersion"
4. You should be redirected to YouVersion's login page
5. Authorize the app
6. You'll be redirected back to the app and signed in

### Note on YouVersion Integration

YouVersion OAuth creates a Supabase account automatically using the YouVersion user's data. The user's YouVersion access token is stored in their Supabase user metadata, which allows your app to:
- Access their YouVersion reading plans
- Sync their Bible highlights
- Access their YouVersion profile data

---

## Part 4: Update app.json

Add the Apple Sign-In entitlement to your iOS configuration:

```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.rooteddaily.bible",
  "buildNumber": "11",
  "infoPlist": {
    "UIBackgroundModes": ["audio"],
    "ITSAppUsesNonExemptEncryption": false
  },
  "entitlements": {
    "com.apple.developer.applesignin": ["Default"]
  }
}
```

---

## Part 5: Test the Integration

### Development Testing

1. Start your development server:
   ```bash
   npm start
   ```

2. Test on a physical device (OAuth doesn't work well in simulators):
   - iOS: Open on a physical iPhone
   - Android: Open on a physical Android device

3. Navigate to the login screen and tap:
   - "Continue with Google"
   - "Continue with Apple"
   - "Continue with YouVersion"

### Common Issues

#### "Redirect URI mismatch"
- Double-check your redirect URIs match exactly in:
  - Google Cloud Console
  - Apple Developer Services ID
  - Supabase Provider settings
- Format: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

#### "Invalid client_id"
- Verify the Client IDs are correct
- For Google: Make sure you're using the Web Client ID in Supabase
- For Apple: Verify the Service ID matches

#### "Network Error"
- Check your .env file has correct Supabase credentials:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
  ```
- Restart the Expo server after changing .env

#### OAuth doesn't redirect back to app
- Check app.json has the correct scheme: `"scheme": "rooted-daily"`
- Make sure you're testing on a physical device
- Try rebuilding the app: `npm run ios` or `npm run android`

---

## Part 6: Build for Production (TestFlight/Play Store)

### Update Your Build

After configuring OAuth, rebuild your app:

```bash
# For iOS (TestFlight)
eas build --platform ios --profile production

# For Android (Play Store)
eas build --platform android --profile production
```

### Post-Build Configuration

#### Google OAuth
After your build completes:
1. Get the SHA-1 certificate fingerprint from your Android build
2. Add it to Google Cloud Console > OAuth 2.0 Client ID

#### Apple OAuth
- Already configured above
- Make sure your production bundle ID matches Apple Developer configuration

---

## Troubleshooting

### Check Supabase Logs
1. Go to Supabase Dashboard > Authentication > Logs
2. Watch for authentication attempts
3. Check error messages

### Test Network Connectivity
```bash
# Test if your app can reach Supabase
curl https://[YOUR-PROJECT-REF].supabase.co/auth/v1/health
```

### Enable Debug Logging
Add to your AuthService.ts for debugging:
```typescript
console.log('OAuth URL:', data?.url);
console.log('Redirect To:', redirectTo);
```

---

## Next Steps

Once OAuth is working:
1. Test sign-in on multiple devices
2. Test sign-out and re-authentication
3. Verify user data is syncing properly
4. Consider adding email/password as a backup option (already implemented!)

---

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/auth/social-login
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Apple Sign-In: https://developer.apple.com/sign-in-with-apple/
