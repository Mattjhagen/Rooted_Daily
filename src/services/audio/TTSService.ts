// src/services/audio/TTSService.ts

import * as FileSystem from 'expo-file-system';
import CryptoJS from 'crypto-js';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio_cache/`;

const ELEVENLABS_VOICE_ID = 'nPczCjzI2devNBz1zQ9n'; // Marcus - Great for Scripture

/**
 * TTSService handles generating audio from text.
 * Priority: ElevenLabs → OpenAI → Native device TTS (free, unlimited, always works)
 */
export class TTSService {
  private static async ensureCacheDir() {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
    }
  }

  /**
   * Cleans text for natural speech (strips markdown, expands references)
   */
  static cleanText(text: string): string {
    let clean = text
      .replace(/\*\*|__/g, '') // Strip bold
      .replace(/\*|_/g, '')    // Strip italics
      .replace(/#+\s/g, '')    // Strip headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Strip links, keep text

    // Expand Bible references: "John 3:16" -> "John chapter 3 verse 16"
    clean = clean.replace(/(\b[A-Za-z]+\b)\s(\d+):(\d+)/g, '$1 chapter $2 verse $3');

    return clean.trim();
  }

  /**
   * Returns an audio URI. Always succeeds — never returns null.
   * Falls back gracefully: ElevenLabs → OpenAI → Native device TTS.
   */
  static async getAudio(text: string, voice?: string): Promise<string> {
    // 1. Try ElevenLabs (highest quality)
    if (ELEVENLABS_API_KEY) {
      try {
        const url = await this.getElevenLabsAudio(text, voice || ELEVENLABS_VOICE_ID);
        if (url) return url;
      } catch (e) {
        console.warn('ElevenLabs unavailable, trying OpenAI TTS.');
      }
    }

    // 2. Try OpenAI TTS
    if (OPENAI_API_KEY) {
      try {
        const url = await this.getOpenAIAudio(text);
        if (url) return url;
      } catch (e) {
        console.warn('OpenAI TTS unavailable, using native device TTS.');
      }
    }

    // 3. Native device TTS — always free, always available
    const cleanedText = this.cleanText(text);
    return `speech://${cleanedText}`;
  }

  private static async getElevenLabsAudio(text: string, voiceId: string): Promise<string | null> {
    const cleanedText = this.cleanText(text);
    const hash = CryptoJS.MD5(cleanedText + voiceId).toString();
    const filePath = `${AUDIO_CACHE_DIR}${hash}.mp3`;

    await this.ensureCacheDir();

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) return filePath;

    const response = await FileSystem.downloadAsync(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      filePath,
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        httpMethod: 'POST',
        body: JSON.stringify({
          text: cleanedText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (response.status !== 200) {
      throw new Error(`ElevenLabs Error: ${response.status}`);
    }

    return filePath;
  }

  private static async getOpenAIAudio(
    text: string,
    voice: 'alloy' | 'shimmer' | 'echo' = 'shimmer'
  ): Promise<string | null> {
    const cleanedText = this.cleanText(text);
    const hash = CryptoJS.MD5(cleanedText + voice).toString();
    const filePath = `${AUDIO_CACHE_DIR}${hash}.mp3`;

    await this.ensureCacheDir();

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) return filePath;

    const response = await FileSystem.downloadAsync(
      'https://api.openai.com/v1/audio/speech',
      filePath,
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        httpMethod: 'POST',
        body: JSON.stringify({
          model: 'tts-1',
          input: cleanedText,
          voice,
        }),
      }
    );

    if (response.status !== 200) {
      throw new Error(`OpenAI TTS Error: ${response.status}`);
    }

    return filePath;
  }
}
