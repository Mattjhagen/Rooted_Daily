// src/services/audio/TTSService.ts

import * as FileSystem from 'expo-file-system/legacy';
import * as Speech from 'expo-speech';
import CryptoJS from 'crypto-js';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio_cache/`;

const ELEVENLABS_VOICE_ID = 'nPczCjzI2devNBz1zQ9n'; // Marcus - Great for Scripture

/**
 * TTSService handles generating audio from text using ElevenLabs or OpenAI TTS
 * and caching results locally.
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
      .replace(/\*|_/g, '')   // Strip italics
      .replace(/#+\s/g, '')   // Strip headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Strip links keep text

    // Expand Bible references: "John 3:16" -> "John chapter 3 verse 16"
    clean = clean.replace(/(\b[A-Za-z]+\b)\s(\d+):(\d+)/g, '$1 chapter $2 verse $3');
    
    return clean.trim();
  }

  static async getAudio(text: string, voice?: string): Promise<string | null> {
    if (ELEVENLABS_API_KEY) {
      return this.getElevenLabsAudio(text, voice || ELEVENLABS_VOICE_ID);
    }
    
    if (OPENAI_API_KEY) {
      return this.getOpenAIAudio(text);
    }

    console.warn('No API Keys for TTS. Falling back to native speech.');
    return `speech://${text}`;
  }

  private static async getElevenLabsAudio(text: string, voiceId: string): Promise<string | null> {
    const cleanedText = this.cleanText(text);
    const hash = CryptoJS.MD5(cleanedText + voiceId).toString();
    const filePath = `${AUDIO_CACHE_DIR}${hash}.mp3`;

    await this.ensureCacheDir();

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) return filePath;

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanedText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) throw new Error(`ElevenLabs Error: ${response.status}`);

      const blob = await response.blob();
      return this.saveBlobToFile(blob, filePath);
    } catch (error) {
      console.error('ElevenLabs TTS failed', error);
      return this.getOpenAIAudio(text); // Fallback
    }
  }

  private static async getOpenAIAudio(text: string, voice: 'alloy' | 'shimmer' | 'echo' = 'shimmer'): Promise<string | null> {
    const cleanedText = this.cleanText(text);
    const hash = CryptoJS.MD5(cleanedText + voice).toString();
    const filePath = `${AUDIO_CACHE_DIR}${hash}.mp3`;

    await this.ensureCacheDir();

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) return filePath;

    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: cleanedText,
          voice: voice,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI TTS Error: ${response.status}`);

      const blob = await response.blob();
      return this.saveBlobToFile(blob, filePath);
    } catch (error) {
      console.error('OpenAI TTS failed', error);
      return null;
    }
  }

  private static async saveBlobToFile(blob: Blob, filePath: string): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        await FileSystem.writeAsStringAsync(filePath, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        resolve(filePath);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
