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

export class PersonalizedDevotionalService {
  /**
   * Generates a personalized devotional based on selected themes
   */
  static async generatePersonalizedDevotional(selectedThemes: string[]): Promise<Devotional> {
    const themeString = selectedThemes.length > 0 
      ? selectedThemes.join(', ') 
      : 'spiritual growth and daily encouragement';

    const systemPrompt = `You are Rooted Daily's AI Bible Buddy. 
Your goal is to create a deeply personal, encouraging, and scripture-centered daily devotional.

User Interests/Themes: ${themeString}

Current Time: ${new Date().toLocaleDateString()}

INSTRUCTIONS:
1. Select ONE powerful Bible verse exactly matching the user's themes.
2. Write a 3-paragraph reflection. Paragraph 1: Connect with the struggle/theme. Paragraph 2: Explain the Biblical truth. Paragraph 3: Practical application for today.
3. Write a short, heartfelt "Heart Check" prayer.
4. Keep the tone warm, pastoral, and authentic.
5. Provide a title for the devotion.

Format your response as a JSON object:
{
  "title": "String",
  "verseRef": "String (e.g. Psalm 23:1)",
  "verseText": "String",
  "body": "String (3 paragraphs)",
  "prayer": "String"
}`;

    try {
      const response = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Please create my daily devotion for today focusing on ${themeString}.` }
          ]
        }),
      });

      if (!response.ok) throw new Error('AI Generation failed');

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract JSON from potential markdown blocks
      const jsonStr = content.match(/\{[\s\S]*\}/)?.[0] || content;
      const parsed = JSON.parse(jsonStr);

      return {
        id: `ai_${Date.now()}`,
        title: parsed.title,
        body: parsed.body + '\n\n' + '**Heart Check:**\n' + parsed.prayer,
        verseRef: parsed.verseRef,
        verseText: parsed.verseText,
        authorName: 'Rooted AI Buddy',
        authorTitle: 'Personalized Guide',
        status: 'approved',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Personalized Devotional Generation Error:', error);
      throw error;
    }
  }
}
