// src/features/chat/chatService.ts

import { buildSystemPrompt, buildUserMessage } from './systemPrompt';

/**
 * AI DISCLAIMER: AI responses are for reflection purposes only. 
 * They do not constitute theological instruction or replace 
 * the guidance of a pastor or church community.
 */

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;

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

  // FAIL-SAFE: We inject the system instructions as the very first instruction 
  // for the model to ensure compatibility across all Gemini endpoints.
  const contents = [
    {
      role: 'user',
      parts: [{ 
        text: `${systemInstructions}\n\nUser Question and Context:\n${groundedUserMessage}` 
      }]
    }
  ];

  // If there is history, we'd add it here, but for Gemini simplicity we'll keep it grounded
  // In a multi-turn conversation, you'd prepend the system prompt to the FIRST user message.

  if (!API_KEY) {
    throw new Error('Gemini API Key missing. Please check your .env file.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.8, // Slightly higher for more "charismatic" responses
      }
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    const errorMessage = errorBody?.error?.message || '';
    throw new Error(`AI Service Error: ${response.status} - ${errorMessage}`);
  }

  const data = await response.json();
  const fullText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Parse suggestions
  const suggMatch = fullText.match(/SUGGESTIONS_JSON:\s*(\[.*?\])/s);
  let suggestions: string[] = [];
  let cleanText = fullText;

  if (suggMatch) {
    try {
      suggestions = JSON.parse(suggMatch[1]);
    } catch (e) {
      console.error('Failed to parse suggestions', e);
    }
    cleanText = fullText.replace(/SUGGESTIONS_JSON:\s*\[.*?\]/s, '').trim();
  }

  return { text: cleanText, suggestions };
}
