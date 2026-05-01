// src/features/devotionals/PersonalizedDevotionalService.ts

import { Devotional } from './types';

const AI_PROXY_URL = process.env.EXPO_PUBLIC_AI_PROXY_URL || 'https://rooted-ai.mattjhagen.workers.dev';

export interface UserInterest {
  id: string;
  label: string;
  selected: boolean;
}

export const COMMON_THEMES: UserInterest[] = [
  { id: 'doubt', label: 'Doubt', selected: false },
  { id: 'fear', label: 'Fear/Anxiety', selected: false },
  { id: 'death', label: 'Grief/Loss', selected: false },
  { id: 'faith', label: 'Strengthening Faith', selected: false },
  { id: 'character_jesus', label: 'Character of Jesus', selected: false },
  { id: 'history', label: 'Historical Context', selected: false },
  { id: 'purpose', label: 'Seeking Purpose', selected: false },
  { id: 'gratitude', label: 'Gratitude', selected: false },
  { id: 'relationships', label: 'Relationships', selected: false },
  { id: 'patience', label: 'Patience', selected: false },
];

import { DAILY_VERSES } from '../../data/dailyVerses';

export class PersonalizedDevotionalService {
  /**
   * Generates a personalized devotional based on selected themes
   */
  /**
   * Generates a personalized devotional based on selected themes
   */
  static async generatePersonalizedDevotional(selectedThemes: string[]): Promise<Devotional> {
    // 1. Find a relevant "anchor" verse from our local library
    const anchorVerse = DAILY_VERSES.find((v: any) => 
      selectedThemes.some(theme => v.theme.toLowerCase().includes(theme.toLowerCase()))
    ) || DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];

    const themeString = selectedThemes.length > 0 
      ? selectedThemes.join(', ') 
      : 'spiritual growth and daily encouragement';

    const systemPrompt = `You are Rooted Daily's AI Pastoral Counselor. 
Your goal is to provide deeply personal, empathetic, and scripture-centered guidance.
Tone: Warm, wise, pastoral, and authentic. Avoid "AI-speak."

User Interests/Themes: ${themeString}
Anchor Verse: ${anchorVerse.ref} - "${anchorVerse.reflection}"

INSTRUCTIONS:
1. Use the Anchor Verse provided as the foundation of your counsel.
2. Write a 3-paragraph reflection:
   - Para 1: Empathetic connection to the user's current heart state (${themeString}).
   - Para 2: Biblical wisdom and context from ${anchorVerse.ref}.
   - Para 3: Gentle, practical steps for applying this truth today.
3. Write a short "Heart Check" prayer (1-2 sentences).
4. Provide a comforting title.

RESPONSE FORMAT (Strict JSON):
{
  "title": "Title here",
  "body": "3 paragraphs of text",
  "prayer": "Short prayer here"
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `I'm struggling with ${themeString}. Please provide some Biblical counsel using ${anchorVerse.ref}.` }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('AI Generation failed');

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Extract JSON from potential markdown blocks or preamble
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in AI response');
      
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        id: `ai_${Date.now()}`,
        title: parsed.title || `Reflections on ${anchorVerse.ref}`,
        body: (parsed.body || 'Thinking on God\'s word...') + '\n\n' + '**Heart Check:**\n' + (parsed.prayer || 'Lord, guide my heart today.'),
        verseRef: anchorVerse.ref,
        verseText: anchorVerse.reflection,
        authorName: 'Rooted AI Buddy',
        authorTitle: 'Personalized Counselor',
        status: 'approved',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Personalized Devotional Generation Error:', error);
      clearTimeout(timeoutId);
      
      // Fallback: Return a locally generated "devotional" if AI fails
      // This ensures the user isn't stuck with an error screen.
      return {
        id: `fb_${Date.now()}`,
        title: `A Moment of Peace: ${anchorVerse.ref}`,
        body: `Today, we focus on ${themeString.toLowerCase()}. Even when technology fails us, God's Word remains constant.\n\n${anchorVerse.reflection}\n\nTake a moment to sit with this truth. Consider how God is calling you to trust Him in the midst of your current situation.\n\n**Heart Check:**\nLord, thank You for being our constant refuge. Help me to hear Your voice above the noise of the world today. Amen.`,
        verseRef: anchorVerse.ref,
        verseText: anchorVerse.reflection,
        authorName: 'Rooted Daily',
        authorTitle: 'Daily Encouragement',
        status: 'approved',
        createdAt: new Date().toISOString(),
      };
    }
  }
}
