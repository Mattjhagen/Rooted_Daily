// backend/heartbeat.js
// This script is designed to run on a server or as a scheduled task (e.g., GitHub Action or Supabase Edge Function).
// It generates friendly, AI-powered "heartbeat" notifications to nudge users to check in.

const fetch = require('node-fetch');

// --- Configuration ---
const SUPABASE_URL = 'https://xphxtkdsshqsddajzlkj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Requires service key for user list access
const AI_PROXY_URL = 'https://rooted-ai.mattjhagen.workers.dev';
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Generates a friendly question using the AI proxy.
 */
async function generateHeartbeatMessage() {
    const timeOfDay = getTimeOfDay();
    const systemPrompt = `You are Rooted, a close and charismatic friend of the user. 
    Your goal is to send a short, warm, and engaging "heartbeat" message to nudge them to stay in the Word. 
    Ask a question that feels personal and friendly, like "Hey! How's your ${timeOfDay} going?" or "Did that verse we read earlier stay with you today?".
    KEEP IT SHORT: Under 80 characters. NO EMOJIS. Just plain, warm text.`;

    try {
        const response = await fetch(AI_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Generate a friendly nudge for a ${timeOfDay} check-in.` }
                ]
            })
        });

        if (!response.ok) throw new Error('AI Proxy failed');
        const data = await response.json();
        let message = data.choices?.[0]?.message?.content || data.text;
        
        // Clean up message (remove quotes if any)
        message = message.replace(/^["']|["']$/g, '').trim();
        return message;
    } catch (err) {
        console.error('Failed to generate AI message, using fallback:', err);
        return "Hey friend! Just checking in. Have you found a moment for the Word today?";
    }
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

/**
 * Fetches all users with push tokens from Supabase.
 */
async function getPushTokens() {
    if (!SUPABASE_SERVICE_KEY) {
        console.warn('SUPABASE_SERVICE_KEY missing. Returning empty token list.');
        return [];
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=expo_push_token&expo_push_token=not.is.null`, {
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch profiles from Supabase');
        return [];
    }

    const profiles = await response.json();
    return profiles.map(p => p.expo_push_token);
}

/**
 * Sends notifications via Expo Push API.
 */
async function sendNotifications(tokens, message) {
    const messages = tokens.map(token => ({
        to: token,
        sound: 'default',
        title: 'Rooted Daily',
        body: message,
        data: { url: '/(tabs)' },
    }));

    // Expo recommends sending in chunks of 100
    const chunks = [];
    while (messages.length > 0) {
        chunks.push(messages.splice(0, 100));
    }

    for (const chunk of chunks) {
        try {
            const response = await fetch(EXPO_PUSH_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            });
            console.log(`Sent chunk of ${chunk.length} notifications.`);
        } catch (err) {
            console.error('Error sending notification chunk:', err);
        }
    }
}

/**
 * Main Execution
 */
async function runHeartbeat() {
    console.log('Starting Heartbeat Service...');
    
    const message = await generateHeartbeatMessage();
    console.log(`Generated Message: "${message}"`);

    const tokens = await getPushTokens();
    console.log(`Found ${tokens.length} users with push tokens.`);

    if (tokens.length > 0) {
        await sendNotifications(tokens, message);
    }
    
    console.log('Heartbeat Service Finished.');
}

runHeartbeat().catch(console.error);
