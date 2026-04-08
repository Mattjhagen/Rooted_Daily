// src/services/audio/TTSService.ts

import * as FileSystem from 'expo-file-system/legacy';
import CryptoJS from 'crypto-js';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio_cache/`;

/**
 * TTSService handles generating audio from text using OpenAI TTS
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

  static async getAudio(text: string, voice: 'alloy' | 'shimmer' | 'echo' = 'shimmer'): Promise<string | null> {
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API Key missing for TTS');
      return null;
    }

    const cleanedText = this.cleanText(text);
    const hash = CryptoJS.MD5(cleanedText + voice).toString();
    const filePath = `${AUDIO_CACHE_DIR}${hash}.mp3`;

    await this.ensureCacheDir();

    // Check Cache
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      return filePath;
    }

    // Generate via OpenAI
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

      if (!response.ok) {
        throw new Error(`OpenAI TTS Error: ${response.status}`);
      }

      // Convert response to base64 and save to file
      const blob = await response.blob();
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
      
    } catch (error) {
      console.error('TTS Generation failed', error);
      return null;
    }
  }
}
