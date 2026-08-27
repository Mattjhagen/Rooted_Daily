// src/features/chat/chatService.ts

import { buildSystemPrompt, buildUserMessage } from './systemPrompt';

const GEMINI_KEY   = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const OPENAI_KEY   = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const CLAUDE_KEY   = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
// Groq key lives securely in Cloudflare Worker — never in the app bundle
const AI_PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL || 'https://rooted-ai.mattjhagen.workers.dev';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  text: string;
  suggestions: string[];
}

// ── 1. Groq via Cloudflare Worker (Llama 3.3 70B — primary, 14,400 req/day free)
async function callGroq(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq proxy error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'Groq error');
  return data.choices?.[0]?.message?.content ?? '';
}

// ── 2. Gemini (fallback)
async function callGemini(history: ChatMessage[], userMessage: string, systemPrompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

  const contents = [
    ...history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      system_instruction: { parts: [{ text: systemPrompt }] }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Gemini Error Body:', errorBody);
    throw new Error('Gemini API Error');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// ── 3. OpenAI (fallback)
async function callOpenAI(messages: any[]): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    })
  });

  if (!response.ok) throw new Error('OpenAI Failed');
  const data = await response.json();
  return data.choices[0].message.content;
}

// ── 4. Claude (last resort)
async function callClaude(messages: any[]): Promise<string> {
  const systemMessage = messages.find(m => m.role === 'system')?.content;
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY || '',
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemMessage,
      messages: chatMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    })
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Claude API Error:', err);
    throw new Error('Claude Failed');
  }
  const data = await response.json();
  return data.content[0].text;
}

// ── Main export
export async function sendChatMessage(
  history: ChatMessage[],
  userMessage: string,
  verseRef: string,
  verseText: string,
  chapterSummary?: string,
  crossRefs?: string[]
): Promise<ChatResponse> {
  const groundedUserMessage = buildUserMessage(userMessage, verseRef, verseText, chapterSummary, crossRefs);
  const systemInstructions = buildSystemPrompt();

  const fullHistory: ChatMessage[] = [
    { role: 'system', content: systemInstructions },
    ...history,
    { role: 'user', content: groundedUserMessage }
  ];

  // 1. Groq (primary)
  try {
    const text = await callGroq(fullHistory);
    return parseResponse(text);
  } catch (e: any) {
    console.warn('Groq failed, trying Gemini:', e.message);
  }

  // 2. Gemini
  try {
    const text = await callGemini(history, groundedUserMessage, systemInstructions);
    return parseResponse(text);
  } catch (e: any) {
    console.warn('Gemini failed, trying OpenAI:', e.message);
  }

  // 3. OpenAI
  try {
    const text = await callOpenAI(fullHistory);
    return parseResponse(text);
  } catch (e: any) {
    console.warn('OpenAI failed, trying Claude:', e.message);
  }

  // 4. Claude
  try {
    const text = await callClaude(fullHistory);
    return parseResponse(text);
  } catch (e: any) {
    console.error('All AI providers failed:', e.message);
    throw new Error('Our AI is currently unavailable. Please check your internet or try again later.');
  }
}

function parseResponse(text: string): ChatResponse {
  if (!text) return { text: 'I am here to help you reflect.', suggestions: [] };

  const jsonMatch = text.match(/SUGGESTIONS_JSON:(\[.*\])/);
  let suggestions: string[] = [];

  if (jsonMatch) {
    try {
      suggestions = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.warn('Failed to parse suggestions JSON', e);
    }
  }

  const cleanText = text.replace(/SUGGESTIONS_JSON:\[.*\]/g, '').trim();

  return {
    text: cleanText,
    suggestions: suggestions.slice(0, 3)
  };
}
