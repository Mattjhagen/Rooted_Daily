// src/features/settings/apiKeyStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AIProvider = 'auto' | 'gemini' | 'groq' | 'openai' | 'claude' | 'openrouter';

export interface ProviderMeta {
  id: AIProvider;
  name: string;
  badge?: string;
  defaultModel: string;
  getKeyUrl: string;
  getKeyLabel: string;
  helpText: string;
  placeholder: string;
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'auto',
    name: 'Auto (Cloudflare Proxy & Fallbacks)',
    badge: 'Free / Default',
    defaultModel: 'Llama 3.3 70B & Gemini',
    getKeyUrl: '',
    getKeyLabel: '',
    helpText: 'Uses Rooted Daily’s proxy and built-in fallbacks. If it is unavailable or rate-limited, choose a provider below to add your own key.',
    placeholder: '',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Recommended Free',
    defaultModel: 'gemini-1.5-flash',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    getKeyLabel: 'Get Free Gemini Key (Google AI Studio) →',
    helpText: 'Google provides a generous 100% free tier (15 RPM / 1M tokens/min) with exceptional scriptural comprehension.',
    placeholder: 'AIzaSy...',
  },
  {
    id: 'groq',
    name: 'Groq (Llama 3.3 70B)',
    badge: 'Ultra Fast Free',
    defaultModel: 'llama-3.3-70b-versatile',
    getKeyUrl: 'https://console.groq.com/keys',
    getKeyLabel: 'Get Free Groq Key (Groq Console) →',
    helpText: 'Groq provides instant inference (300+ tokens/sec) on Llama 3.3 70B with 14,400 free requests per day.',
    placeholder: 'gsk_...',
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    badge: 'GPT-4o mini',
    defaultModel: 'gpt-4o-mini',
    getKeyUrl: 'https://platform.openai.com/api-keys',
    getKeyLabel: 'Get OpenAI Key (OpenAI Platform) →',
    helpText: 'Uses GPT-4o mini for fast, accurate biblical insights. Requires an OpenAI account with available credit balance.',
    placeholder: 'sk-...',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    badge: 'Claude 3.5 Haiku',
    defaultModel: 'claude-3-5-haiku-20241022',
    getKeyUrl: 'https://console.anthropic.com/settings/keys',
    getKeyLabel: 'Get Claude Key (Anthropic Console) →',
    helpText: 'Claude 3.5 Haiku offers deep theological empathy, nuanced prose, and thoughtful devotional reflections.',
    placeholder: 'sk-ant-...',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: '100+ Models',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    getKeyUrl: 'https://openrouter.ai/keys',
    getKeyLabel: 'Get OpenRouter Key (OpenRouter.ai) →',
    helpText: 'Access hundreds of AI models from a single API key, including free models and top proprietary models.',
    placeholder: 'sk-or-...',
  },
];

export const ELEVENLABS_META = {
  name: 'ElevenLabs Generative Audio',
  getKeyUrl: 'https://elevenlabs.io/app/settings/api-keys',
  getKeyLabel: 'Get ElevenLabs API Key (ElevenLabs Console) →',
  voiceLibraryUrl: 'https://elevenlabs.io/voice-library',
  voiceLibraryLabel: 'Browse ElevenLabs Voice Library →',
  defaultVoiceId: 'nPczCjzI2devNBz1zQ9n', // Marcus
  helpText: 'Listen to Scripture in hyper-realistic dramatized audio or in your own cloned personal voice.',
};

export const POPULAR_VOICES = [
  { id: 'nPczCjzI2devNBz1zQ9n', name: 'Marcus (Default Scripture Narrator)' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Calm & Reflective)' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Empathetic & Warm)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Gentle & Meditative)' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Deep & Authoritative)' },
];

interface ApiKeyState {
  selectedAiProvider: AIProvider;
  geminiKey: string;
  groqKey: string;
  openaiKey: string;
  claudeKey: string;
  openrouterKey: string;
  elevenlabsKey: string;
  elevenlabsVoiceId: string;

  setAiProvider: (provider: AIProvider) => void;
  setKey: (provider: AIProvider, key: string) => void;
  setElevenlabsKey: (key: string) => void;
  setElevenlabsVoiceId: (voiceId: string) => void;
  getKeyForProvider: (provider: AIProvider) => string;
  clearKey: (provider: AIProvider | 'elevenlabs') => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set, get) => ({
      selectedAiProvider: 'auto',
      geminiKey: '',
      groqKey: '',
      openaiKey: '',
      claudeKey: '',
      openrouterKey: '',
      elevenlabsKey: '',
      elevenlabsVoiceId: 'nPczCjzI2devNBz1zQ9n',

      setAiProvider: (selectedAiProvider) => set({ selectedAiProvider }),

      setKey: (provider, key) => {
        const cleanKey = key.trim();
        switch (provider) {
          case 'gemini': set({ geminiKey: cleanKey }); break;
          case 'groq': set({ groqKey: cleanKey }); break;
          case 'openai': set({ openaiKey: cleanKey }); break;
          case 'claude': set({ claudeKey: cleanKey }); break;
          case 'openrouter': set({ openrouterKey: cleanKey }); break;
        }
      },

      setElevenlabsKey: (key) => set({ elevenlabsKey: key.trim() }),
      setElevenlabsVoiceId: (voiceId) => set({ elevenlabsVoiceId: voiceId.trim() }),

      getKeyForProvider: (provider) => {
        const state = get();
        switch (provider) {
          case 'gemini': return state.geminiKey;
          case 'groq': return state.groqKey;
          case 'openai': return state.openaiKey;
          case 'claude': return state.claudeKey;
          case 'openrouter': return state.openrouterKey;
          default: return '';
        }
      },

      clearKey: (target) => {
        switch (target) {
          case 'gemini': set({ geminiKey: '' }); break;
          case 'groq': set({ groqKey: '' }); break;
          case 'openai': set({ openaiKey: '' }); break;
          case 'claude': set({ claudeKey: '' }); break;
          case 'openrouter': set({ openrouterKey: '' }); break;
          case 'elevenlabs': set({ elevenlabsKey: '' }); break;
        }
      },
    }),
    {
      name: 'rooted-api-keys',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
