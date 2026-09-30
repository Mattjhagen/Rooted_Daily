// src/features/chat/chatService.ts

import { buildSystemPrompt, buildUserMessage } from './systemPrompt';
import { useApiKeyStore, AIProvider } from '../settings/apiKeyStore';

const ENV_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ENV_OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const ENV_CLAUDE_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const AI_PROXY_URL   = process.env.EXPO_PUBLIC_AI_PROXY_URL || 'https://rooted-ai.mattjhagen.workers.dev';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  text: string;
  suggestions: string[];
}

// ── 1. Groq (Direct with key OR via Cloudflare Worker)
async function callGroq(messages: ChatMessage[], apiKey?: string): Promise<string> {
  if (apiKey) {
    // Direct Groq API call with user's BYOK key
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      let parsedMsg = err;
      try {
        const json = JSON.parse(err);
        parsedMsg = json.error?.message || err;
      } catch (e) {}
      throw new Error(`Groq API error (${response.status}): ${parsedMsg}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? '';
  }

  // Cloudflare Worker proxy fallback
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
  if (data.error) throw new Error(data.error.message || 'Groq proxy error');
  return data.choices?.[0]?.message?.content ?? '';
}

// ── 2. Gemini
async function callGemini(
  history: ChatMessage[], 
  userMessage: string, 
  systemPrompt: string, 
  apiKey?: string
): Promise<string> {
  const key = apiKey || ENV_GEMINI_KEY;
  if (!key) throw new Error('No Gemini API key available');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

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
    let parsedMsg = errorBody;
    try {
      const json = JSON.parse(errorBody);
      parsedMsg = json.error?.message || errorBody;
    } catch (e) {}
    console.error('Gemini Error Body:', errorBody);
    throw new Error(`Gemini API error (${response.status}): ${parsedMsg}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── 3. OpenAI (GPT-4o mini)
async function callOpenAI(messages: any[], apiKey?: string): Promise<string> {
  const key = apiKey || ENV_OPENAI_KEY;
  if (!key) throw new Error('No OpenAI API key available');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages.map(m => ({ role: m.role, content: m.content }))
    })
  });

  if (!response.ok) {
    const err = await response.text();
    let parsedMsg = err;
    try {
      const json = JSON.parse(err);
      parsedMsg = json.error?.message || err;
    } catch (e) {}
    throw new Error(`OpenAI error (${response.status}): ${parsedMsg}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ── 4. Claude (Anthropic)
async function callClaude(messages: any[], apiKey?: string): Promise<string> {
  const key = apiKey || ENV_CLAUDE_KEY;
  if (!key) throw new Error('No Claude API key available');

  const systemMessage = messages.find(m => m.role === 'system')?.content;
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
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
    let parsedMsg = err;
    try {
      const json = JSON.parse(err);
      parsedMsg = json.error?.message || err;
    } catch (e) {}
    console.error('Claude API Error:', err);
    throw new Error(`Claude error (${response.status}): ${parsedMsg}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? '';
}

// ── 5. OpenRouter
async function callOpenRouter(messages: any[], apiKey?: string): Promise<string> {
  if (!apiKey) throw new Error('No OpenRouter API key available');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://rootedapp.space',
      'X-Title': 'Rooted Daily',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })
  });

  if (!response.ok) {
    const err = await response.text();
    let parsedMsg = err;
    try {
      const json = JSON.parse(err);
      parsedMsg = json.error?.message || err;
    } catch (e) {}
    throw new Error(`OpenRouter error (${response.status}): ${parsedMsg}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ── Quick API Connection Tester (for Settings BYOK UI)
export async function testProviderConnection(
  provider: AIProvider | 'elevenlabs',
  key: string
): Promise<{ success: boolean; message: string }> {
  const cleanKey = key.trim();
  if (!cleanKey) {
    return { success: false, message: 'Please enter an API key to test.' };
  }

  try {
    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Respond with the word OK.' }] }]
          })
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || `HTTP ${res.status}`);
      }
      return { success: true, message: 'Connected to Google Gemini successfully!' };
    }

    if (provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5,
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || `HTTP ${res.status}`);
      }
      return { success: true, message: 'Connected to Groq (Llama 3.3 70B) successfully!' };
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 5,
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || `HTTP ${res.status}`);
      }
      return { success: true, message: 'Connected to OpenAI (GPT-4o mini) successfully!' };
    }

    if (provider === 'claude') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': cleanKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say OK' }]
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || `HTTP ${res.status}`);
      }
      return { success: true, message: 'Connected to Anthropic Claude successfully!' };
    }

    if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${cleanKey}` }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || `HTTP ${res.status}`);
      }
      return { success: true, message: 'Connected to OpenRouter successfully!' };
    }

    if (provider === 'elevenlabs') {
      const res = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': cleanKey }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const tier = data.subscription?.tier || 'Free';
      return { success: true, message: `Connected to ElevenLabs! Tier: ${tier}` };
    }

    return { success: false, message: 'Unknown provider' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed.' };
  }
}

// ── Main Chat Send Function
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

  const keyStore = useApiKeyStore.getState();
  const selectedProvider = keyStore.selectedAiProvider;

  // If user selected a specific provider explicitly:
  if (selectedProvider !== 'auto') {
    const customKey = keyStore.getKeyForProvider(selectedProvider);

    try {
      let text = '';
      if (selectedProvider === 'gemini') {
        text = await callGemini(history, groundedUserMessage, systemInstructions, customKey);
      } else if (selectedProvider === 'groq') {
        text = await callGroq(fullHistory, customKey);
      } else if (selectedProvider === 'openai') {
        text = await callOpenAI(fullHistory, customKey);
      } else if (selectedProvider === 'claude') {
        text = await callClaude(fullHistory, customKey);
      } else if (selectedProvider === 'openrouter') {
        text = await callOpenRouter(fullHistory, customKey);
      }
      return parseResponse(text);
    } catch (e: any) {
      console.error(`Selected provider ${selectedProvider} failed:`, e.message);
      // Give the user the specific diagnostic error so they know what to fix
      throw new Error(`${selectedProvider.toUpperCase()} Error: ${e.message}\n\nPlease check your key in Settings → API Keys or switch to Auto.`);
    }
  }

  // Auto Mode: Prioritize any user-configured custom keys first
  const userGroqKey = keyStore.groqKey;
  const userGeminiKey = keyStore.geminiKey;
  const userOpenAIKey = keyStore.openaiKey;
  const userClaudeKey = keyStore.claudeKey;
  const userOpenRouterKey = keyStore.openrouterKey;

  // 1. User's Gemini key (fast & reliable)
  if (userGeminiKey) {
    try {
      const text = await callGemini(history, groundedUserMessage, systemInstructions, userGeminiKey);
      return parseResponse(text);
    } catch (e: any) {
      console.warn('User Gemini key failed, falling back:', e.message);
    }
  }

  // 2. User's Groq key
  if (userGroqKey) {
    try {
      const text = await callGroq(fullHistory, userGroqKey);
      return parseResponse(text);
    } catch (e: any) {
      console.warn('User Groq key failed, falling back:', e.message);
    }
  }

  // 3. User's OpenAI key
  if (userOpenAIKey) {
    try {
      const text = await callOpenAI(fullHistory, userOpenAIKey);
      return parseResponse(text);
    } catch (e: any) {
      console.warn('User OpenAI key failed, falling back:', e.message);
    }
  }

  // 4. User's Claude key
  if (userClaudeKey) {
    try {
      const text = await callClaude(fullHistory, userClaudeKey);
      return parseResponse(text);
    } catch (e: any) {
      console.warn('User Claude key failed, falling back:', e.message);
    }
  }

  // 5. User's OpenRouter key
  if (userOpenRouterKey) {
    try {
      const text = await callOpenRouter(fullHistory, userOpenRouterKey);
      return parseResponse(text);
    } catch (e: any) {
      console.warn('User OpenRouter key failed, falling back:', e.message);
    }
  }

  // 6. Default Cloudflare Groq Proxy (Free tier)
  try {
    const text = await callGroq(fullHistory);
    return parseResponse(text);
  } catch (e: any) {
    console.warn('Groq proxy failed, trying Gemini env fallback:', e.message);
  }

  // 7. Gemini env key
  if (ENV_GEMINI_KEY) {
    try {
      const text = await callGemini(history, groundedUserMessage, systemInstructions, ENV_GEMINI_KEY);
      return parseResponse(text);
    } catch (e: any) {
      console.warn('Gemini env key failed, trying OpenAI env fallback:', e.message);
    }
  }

  // 8. OpenAI env key
  if (ENV_OPENAI_KEY) {
    try {
      const text = await callOpenAI(fullHistory, ENV_OPENAI_KEY);
      return parseResponse(text);
    } catch (e: any) {
      console.warn('OpenAI env key failed, trying Claude env fallback:', e.message);
    }
  }

  // 9. Claude env key
  if (ENV_CLAUDE_KEY) {
    try {
      const text = await callClaude(fullHistory, ENV_CLAUDE_KEY);
      return parseResponse(text);
    } catch (e: any) {
      console.warn('Claude env key failed:', e.message);
    }
  }

  // If every single option failed:
  throw new Error('Our free AI proxy is currently unavailable or experiencing heavy traffic. You can add your own free Gemini, Groq, or OpenAI API key in Settings → API Keys for unlimited, instant access.');
}

function parseResponse(text: string): ChatResponse {
  if (!text) return { text: 'I am here to help you reflect on this scripture passage.', suggestions: [] };

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
