# Rooted Daily - Setup Guide

## Prerequisites
- Node.js 18 or later
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

## Installation

1. **Clone and Install Dependencies**
   ```bash
   cd Rooted_Daily-main
   npm install
   ```

2. **Configure AI API Keys**
   
   The app requires at least ONE AI provider to be configured for the chat/reflection feature to work.
   
   a. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
   
   b. Open `.env` and add at least one API key:
   
   **RECOMMENDED: Google Gemini (Free Tier)**
   - Visit: https://makersuite.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key and paste it in `.env`:
     ```
     EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyABC123def456GHI789jkl
     ```
   
   **Alternative Options:**
   - **Groq** (via Cloudflare Worker - pre-configured proxy)
   - **OpenAI** (paid): https://platform.openai.com/api-keys
   - **Anthropic Claude** (paid): https://console.anthropic.com/
   
   The app will automatically fall back through available providers if one fails.

3. **Run the App**

   For iOS:
   ```bash
   npm run ios
   ```
   
   For Android:
   ```bash
   npm run android
   ```
   
   For Web (limited functionality):
   ```bash
   npm run web
   ```

## Features

### ✅ Working Features
- **Home Tab**: Daily devotional with verse of the day, reading plans, and progress tracking
- **Bible Tab**: Browse and read the entire Bible (66 books, 1,189 chapters)
- **Journal Tab**: Save reflections and prayers
- **Community Tab**: Connect with other believers (requires Supabase setup)
- **Settings Tab**: Customize reading preferences
- **AI Chat**: Reflect on verses with AI guidance (requires API key)
- **Bible Reader**: Swipe between chapters, highlight verses, audio playback
- **Reading Plans**: "Bible in a Year" canonical and mixed plans

### 🔄 Configuration Needed
- **Community Features**: Requires Supabase account (add keys to `.env`)
- **AI Reflections**: Requires at least one AI API key (see step 2 above)

## Tab Navigation

After setup, you'll see 5 tabs at the bottom:

1. **Home** 🏠 - Daily devotional, verse of the day, reading plans
2. **Journal** 📖 - Your saved reflections and prayers
3. **Bible** 📚 - Browse and read the Bible by book/chapter
4. **Community** 💬 - Chat and connect (requires sign-in)
5. **Settings** ⚙️ - App preferences and account

## Troubleshooting

### AI Chat Not Working?
- Check that you've added at least one API key to `.env`
- Restart the Expo server after adding keys
- Check console for specific error messages

### Community Tab Requires Sign In?
- This feature requires Supabase configuration
- Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `.env`
- Or skip this feature and use other tabs

### App Not Loading?
- Clear Expo cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Make sure you're on Node.js 18 or later

## Project Structure

```
app/
├── (tabs)/           # Main tab screens
│   ├── index.tsx    # Home screen
│   ├── bible.tsx    # Bible browser
│   ├── journal.tsx  # Journal/reflections
│   ├── inbox.tsx    # Community
│   └── settings.tsx # Settings
├── reader/          # Bible reader
├── chat/            # AI chat interface
└── devotionals/     # Community devotionals

src/
├── features/        # Feature modules
│   ├── bible/      # Bible data & services
│   ├── chat/       # AI chat service
│   ├── journal/    # Journal storage
│   └── plans/      # Reading plans
├── components/      # Reusable components
├── theme/          # Colors, typography, spacing
└── services/       # External services (YouVersion, etc)
```

## Development

- The app uses Expo Router for navigation
- Bible data is stored locally (no internet required for reading)
- AI chat requires internet and API keys
- Supabase is optional for community features

## Support

For issues or questions, check:
- Console logs for error messages
- `.env` file is properly configured
- All dependencies are installed
- Expo development server is running

Enjoy using Rooted Daily! 🙏
