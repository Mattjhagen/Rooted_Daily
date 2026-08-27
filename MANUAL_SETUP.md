# Rooted Daily - Manual Setup Guide

## 🚀 Quick Start (What You Need RIGHT NOW)

### ✅ ALREADY CONFIGURED
Your app is **ready to run** with just the Gemini API key already in your `.env` file!

```bash
# Start the app
npm install
npm run ios    # or npm run android
```

**What works immediately:**
- ✅ Bible reading (all 66 books)
- ✅ AI chat for verse reflection
- ✅ Journal (local storage)
- ✅ Reading plans with progress tracking
- ✅ Verse highlighting and bookmarks
- ✅ Audio Bible playback

---

## 📋 Complete Setup Checklist

### 1. ✅ AI API Keys (REQUIRED - Already Done!)

You already have this in your `.env`:
```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

**Note:** Your actual key is already configured - don't change it!

**Alternative Providers (optional backups):**
- **Groq** (free): https://console.groq.com
- **OpenAI** (paid): https://platform.openai.com/api-keys  
- **Claude** (paid): https://console.anthropic.com

Add any additional keys to `.env` and restart the server.

---

### 2. 🔄 Supabase (OPTIONAL - Community Features)

**Skip this if you only want Bible reading + AI chat!**

#### What Supabase Enables:
- 👥 User authentication (sign up/login)
- 💬 Community chat & direct messaging
- 🔄 Cross-device sync for journal entries
- 📖 Community devotionals feed
- ❤️ Verse insights sharing

#### Setup Steps:

**A. Create Supabase Project**
1. Go to https://supabase.com
2. Sign up / Sign in
3. Click "New Project"
4. Choose:
   - Name: `rooted-daily`
   - Database Password: (save this!)
   - Region: Choose closest to your users
5. Wait 2-3 minutes for provisioning

**B. Get Your API Keys**
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Add to your `.env`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Restart Expo server

**C. Run Database Migrations**

Your app includes SQL migrations in `supabase/migrations/`. Run them in order:

**Method 1: Supabase CLI (Recommended)**
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project (get ref from dashboard URL: https://app.supabase.com/project/YOUR-REF)
supabase link --project-ref YOUR-PROJECT-REF

# Push migrations
supabase db push
```

**Method 2: Manual via Dashboard**
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy/paste each file's contents and run:
   - `supabase/migrations/001_devotionals.sql`
   - `supabase/migrations/002_community_chat.sql`
   - `supabase/migrations/003_journal_sync.sql`
   - `supabase/migrations/004_profiles.sql`
   - `supabase/migrations/005_channel_messages.sql`
   - `supabase/migrations/006_moderation_rls.sql`

**D. Enable Email Authentication**
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Configure email templates
4. (Optional) Enable OAuth (Google, Apple, etc.)

**E. Test It**
1. Restart your app
2. Go to **Community** tab
3. Should now show sign-in option instead of error
4. Create an account and test!

---

### 3. 📅 YouVersion API (OPTIONAL - Dynamic Verse of Day)

**Skip this if you're happy with John 3:16 showing on home screen!**

#### What It Enables:
- 📅 Daily verse changes every day
- 🔄 Multiple Bible translations
- Without it: John 3:16 shows as fallback (perfectly fine!)

#### Setup Steps:

**A. Apply for API Access**
1. Go to https://www.youversion.com/developer
2. Fill out the application:
   - App name: Rooted Daily
   - Description: Bible reading app with AI reflection
   - Platform: iOS/Android (React Native)
3. Submit and wait for approval (1-2 weeks typically)

**B. Add API Key**
Once approved, add to `.env`:
```bash
EXPO_PUBLIC_YOUVERSION_API_KEY=your_api_key_here
```

**C. Restart Server**
```bash
# Stop current server (Ctrl+C)
npm start -- --clear
```

**Note:** YouVersion is selective about API access. The app works great without it!

---

## 🗂️ Migration Files Reference

All migrations are in `supabase/migrations/`:

### 001_devotionals.sql
Creates tables for community devotionals:
- `organizations` - Churches/ministries
- `devotionals` - Daily devotionals content
- `devotional_likes` - User likes
- `devotional_comments` - Comments

### 002_community_chat.sql
Creates messaging infrastructure:
- `conversations` - DM threads
- `messages` - Chat messages
- `conversation_participants` - Who's in each conversation

### 003_journal_sync.sql
Enables cross-device journal sync:
- `journal` - Journal entries with cloud sync
- Syncs reflections and prayers

### 004_profiles.sql
User profiles:
- `profiles` - Extended user info
- Avatar, username, bio

### 005_channel_messages.sql
Public channel system:
- `channels` - Public chat rooms
- `channel_messages` - Messages in channels
- `channel_members` - Channel membership

### 006_moderation_rls.sql
Security policies (Row Level Security):
- Ensures users can only access their own data
- Moderators can approve/reject content
- Public content is readable by all

---

## 🎯 What Works Without Extra Setup

With **ONLY** the Gemini key (already configured):

### ✅ Core Bible Features
- Read all 66 books
- 1,189 chapters
- World English Bible translation
- Swipe navigation between chapters
- Search books by name

### ✅ AI Features
- Chat with AI about any verse
- Get contextual explanations
- Ask follow-up questions
- Grounded in Biblical context

### ✅ Journaling
- Save reflections and prayers
- Tag entries (reflection/prayer)
- Mark favorites
- Link to original verses
- Stored locally (works offline)

### ✅ Reading Plans
- Bible in a Year (Canonical order)
- Bible in a Year (OT/NT mixed)
- Progress tracking
- Streak counter
- Points system

### ✅ Study Features
- Verse highlighting (5 colors)
- Bookmarks
- Share verses
- Audio Bible playback
- Multiple font options
- Light/dark themes

---

## ❌ What Requires Extra Setup

### Needs Supabase:
- ❌ User authentication
- ❌ Community chat/messaging
- ❌ Cross-device sync
- ❌ Devotionals feed
- ❌ Community insights on verses

### Needs YouVersion API:
- ❌ Dynamic verse of the day
- ❌ Multiple Bible translations
- Currently shows John 3:16 fallback ✅

---

## 🚀 Running the App

```bash
# Install dependencies (first time only)
cd /Users/matt/Git_Projects/Rooted_Daily-main
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Clear cache if needed
npm start -- --clear
```

---

## 🐛 Troubleshooting

### "AI chat not responding"
**Solution:**
1. Check `.env` has your Gemini key
2. Restart Expo server: `npm start -- --clear`
3. Check console for specific errors
4. Try a different AI provider

### "Community tab says 'Please sign in'"
**This is normal without Supabase!**
- Community features require Supabase setup
- All other features work perfectly without it
- Follow Section 2 above to enable

### "Verse of the Day shows John 3:16"
**This is expected without YouVersion API!**
- John 3:16 is the fallback verse
- App is working correctly
- Follow Section 3 above to get dynamic verses

### "Metro bundler errors"
**Solution:**
```bash
# Clear cache
npm start -- --clear

# If that doesn't work, full reset:
rm -rf node_modules
npm install
npm start
```

### "Can't connect to Expo"
**Solution:**
1. Make sure your phone and computer are on same WiFi
2. Try restarting Expo with `npm start`
3. Try LAN connection in Expo menu
4. Use Expo Go app from App Store

---

## 📱 Tab Navigation

Your app has **4 main tabs**:

1. **🏠 Home**
   - Daily verse (John 3:16 or YouVersion)
   - Reading plan cards
   - Progress tracking
   - Quick access to read

2. **📖 Journal**
   - Your saved reflections
   - Prayer entries
   - Filter by type or favorites
   - Link back to original verses

3. **📚 Bible**
   - Browse all 66 books
   - Quick search
   - Chapter grid view
   - Direct to reader

4. **💬 Community** (requires Supabase)
   - Direct messages
   - Public channels
   - User discovery
   - Prayer wall

5. **⚙️ Settings**
   - App preferences
   - Account settings
   - About & support

---

## 🔐 Environment Variables Summary

Your `.env` file should have:

```bash
# REQUIRED - Already configured ✅
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key_here

# OPTIONAL - For AI fallback
EXPO_PUBLIC_AI_PROXY_URL=https://rooted-ai.mattjhagen.workers.dev
EXPO_PUBLIC_OPENAI_API_KEY=
EXPO_PUBLIC_ANTHROPIC_API_KEY=

# OPTIONAL - For community features
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# OPTIONAL - For dynamic verse of day
EXPO_PUBLIC_YOUVERSION_API_KEY=
```

**Never commit your actual `.env` file to GitHub!** It's already in `.gitignore`.

---

## 📊 Current Status

### ✅ What's Working Now
- Bible reading (all books)
- AI chat (Gemini)
- Journal (local)
- Reading plans
- Highlighting
- Audio playback
- Home screen

### ⏳ Optional Features (Need Setup)
- Community chat → Needs Supabase
- Cross-device sync → Needs Supabase
- Dynamic verse of day → Needs YouVersion
- Devotionals → Needs Supabase

### 🗂️ Temporarily Removed
- Devotionals tab → Preserved in `app/_removed_tabs/`
- Can be restored later when Supabase is set up

---

## 🎉 You're Done!

**Your app is ready to use right now!** 

Everything else in this guide is **optional** - only set up what you need:
- Want community features? → Set up Supabase (Section 2)
- Want dynamic verses? → Apply for YouVersion (Section 3)
- Happy with current features? → You're done! 🎊

The core Bible + AI experience is fully functional with just the Gemini key you already have configured.

---

## 📞 Support

If you run into issues:
1. Check the Troubleshooting section above
2. Check console logs in Expo
3. Review `.env` configuration
4. Ensure dependencies are installed (`npm install`)

**Enjoy using Rooted Daily!** 🙏✨
