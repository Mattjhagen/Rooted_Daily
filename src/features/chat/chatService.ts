// src/features/chat/chatService.ts

import { buildSystemPrompt, buildUserMessage } from './systemPrompt';

/**
 * AI DISCLAIMER: AI responses are for reflection purposes only. 
 * They do not constitute theological instruction or replace 
 * the guidance of a pastor or church community.
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY!;

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

  // We filter out the grounding context from history to avoid confusion
  // but we add it to the final message.
  const messages = [
    ...history,
    { role: 'user' as const, content: groundedUserMessage }
  ];

  if (!API_KEY) {
    console.warn('Anthropic API Key missing. Returning mock response.');
    return {
      text: "I'm Rooted, your Bible study assistant. It looks like the API key isn't configured yet, but I'm ready to help you explore the scripture once it is!",
      suggestions: ["How do I set up the API key?", "Tell me about John 3:16", "What is the WEBU translation?"]
    };
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: buildSystemPrompt(),
      messages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const fullText: string = data.content?.[0]?.text ?? '';

  // Parse suggestions out of the SUGGESTIONS_JSON block
  const suggMatch = fullText.match(/SUGGESTIONS_JSON:(\[.*?\])/s);
  let suggestions: string[] = [];
  let cleanText = fullText;

  if (suggMatch) {
    try {
      suggestions = JSON.parse(suggMatch[1]);
    } catch (e) {
      console.error('Failed to parse suggestions', e);
    }
    cleanText = fullText.replace(/SUGGESTIONS_JSON:\[.*?\]/s, '').trim();
  }

  return { text: cleanText, suggestions };
}
