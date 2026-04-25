# Rooted Heartbeat Service

This service allows you to send AI-powered "heartbeat" notifications to your users to nudge them to check into the app. Because it runs on the server/backend, it works **without needing an app store update**.

## 🚀 How it Works
1.  **AI Generation**: The script calls your existing Cloudflare AI Proxy to generate a friendly, charismatic check-in message (e.g., *"Hey! How is your morning going? Found any peace in the Word yet?"*).
2.  **Targeting**: It fetches all active `expo_push_token` values from your Supabase `profiles` table.
3.  **Delivery**: It sends the notifications through the Expo Push API.

## 🛠️ Setup Instructions

### 1. Requirements
- Node.js installed on your server (or use a GitHub Action).
- `node-fetch` package: `npm install node-fetch`

### 2. Environment Variables
You will need to provide your **Supabase Service Role Key** (found in Project Settings > API). This key is required because it has bypass-RLS permissions to read the user list.

```bash
export SUPABASE_SERVICE_KEY=your_service_role_key
```

### 3. Running Manually
```bash
node backend/heartbeat.js
```

### 4. Automated Scheduling (GitHub Actions)
You can set this up to run automatically 3 times a day (Morning, Afternoon, Evening) using GitHub Actions.

Create a file at `.github/workflows/heartbeat.yml`:

```yaml
name: Heartbeat Notifications
on:
  schedule:
    - cron: '0 14 * * *' # 9 AM EST
    - cron: '0 19 * * *' # 2 PM EST
    - cron: '0 0 * * *'  # 7 PM EST
  workflow_dispatch: # Allow manual trigger

jobs:
  send-notifications:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install node-fetch
      - name: Run Heartbeat
        env:
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        run: node backend/heartbeat.js
```

## 🪴 Customizing the AI Tone
You can adjust the `systemPrompt` inside `backend/heartbeat.js` to change how "Rooted" speaks to your users. Currently, it's set to be a "close, charismatic friend."
