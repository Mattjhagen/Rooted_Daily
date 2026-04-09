// src/features/chat/chatService.ts

import { buildSystemPrompt, buildUserMessage } from './systemPrompt';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  text: string;
  suggestions: string[];
}

export async function sendChatMessage(
  history: ChatMessage[],
  userMessage: string,
  verseRef: string,
  verseText: string,
  chapterSummary?: string,
  crossRefs?: string[]
): Promise<ChatResponse> {
  const groundedUserMessage = buildUserMessage(
    userMessage, verseRef, verseText, chapterSummary, crossRefs
  );
  const systemInstructions = buildSystemPrompt();

  // Define the provider waterfall
  const providers = [
    { name: 'Gemini', call: callGemini },
    { name: 'Anthropic', call: callAnthropic },
    { name: 'OpenAI', call: callOpenAI },
  ];

  let lastError: any = null;

  for (const provider of providers) {
    try {
      console.log(`Attempting AI request with ${provider.name}...`);
      const fullText = await provider.call(systemInstructions, groundedUserMessage, history);
      return parseResponse(fullText);
    } catch (error: any) {
      console.warn(`${provider.name} failed:`, error.message);
      lastError = error;
      // Continue to next provider in loop
    }
  }

  throw lastError || new Error('All AI providers failed. Please check your network or API keys.');
}

async function callGemini(system: string, user: string, history: ChatMessage[]) {
  if (!GEMINI_KEY) throw new Error('Gemini key missing');
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
    })
  });

  if (!response.ok) throw new Error(`Gemini Error ${response.status}`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callAnthropic(system: string, user: string, history: ChatMessage[]) {
  if (!ANTHROPIC_KEY) throw new Error('Anthropic key missing');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      system: system,
      messages: [{ role: 'user', content: user }]
    })
  });

  if (!response.ok) throw new Error(`Anthropic Error ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAI(system: string, user: string, history: ChatMessage[]) {
  if (!OPENAI_KEY) throw new Error('OpenAI key missing');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) throw new Error(`OpenAI Error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

function parseResponse(fullText: string): ChatResponse {
  const suggMatch = fullText.match(/SUGGESTIONS_JSON:?\s*(`{1,3}json\s*)?({.*?\s*)?(\[.*\])/si);
  let suggestions: string[] = [];
  let cleanText = fullText;

  if (suggMatch) {
    try {
      suggestions = JSON.parse(suggMatch[3].trim());
    } catch (e) {
      console.error('Failed to parse suggestions', e);
    }
    cleanText = fullText.replace(/SUGGESTIONS_JSON:?\s*(`{1,3}json\s*)?({.*?)?\[.*\](.*?})?(`{1,3})?/si, '').trim();
  } else {
    const lastArrayMatch = fullText.match(/(\[.*?\])(?!.*\[)/s);
    if (lastArrayMatch) {
      try {
        suggestions = JSON.parse(lastArrayMatch[1]);
        cleanText = fullText.replace(lastArrayMatch[1], '').trim();
      } catch (e) { }
    }
  }

  cleanText = cleanText.replace(/```json.*?```/gsi, '');
  cleanText = cleanText.replace(/SUGGESTIONS_JSON:?/gi, '').trim();

  return { text: cleanText, suggestions: suggestions.slice(0, 4) };
}
