// src/data/dailyVerses.ts

/**
 * LEGAL: This app uses the World English Bible Updated (WEBU) translation.
 * The text is public domain. "World English Bible" is a trademark of eBible.org.
 * Do not label this app or its content as "World English Bible" — use the badge "WEB" only.
 * Source: https://ebible.org/find/show.php?id=engwebu
 */

export interface DailyVerse {
  date: string;
  ref: string;
  theme: string;
  reflection: string;
}

export const DAILY_VERSES: DailyVerse[] = [
  { date: '2026-04-08', ref: 'John 3:16', theme: 'Love', reflection: "God's love is not conditional; it is a sacrificial gift that opens the way for eternal relationship with Him." },
  { date: '2026-04-09', ref: 'Philippians 4:6-7', theme: 'Peace', reflection: 'Anxiety is met with prayer, producing a peace that guards our hearts and minds even when we don\'t understand the path ahead.' },
  { date: '2026-04-10', ref: 'Romans 8:28', theme: 'Providence', reflection: 'Even suffering and confusion are held within a larger purpose, as God weaves all things together for the good of His people.' },
  { date: '2026-04-11', ref: 'Psalm 23:1-3', theme: 'Guidance', reflection: 'The shepherd metaphor speaks to daily provision and restoration, reminding us that we are led by one who knows our needs intimately.' },
  { date: '2026-04-12', ref: 'Matthew 5:3-5', theme: 'Beatitudes', reflection: 'The Sermon on the Mount reframes what it means to flourish, identifying blessing in positions the world often overlooks.' },
  { date: '2026-04-13', ref: 'Proverbs 3:5-6', theme: 'Trust', reflection: 'Trusting God with our whole heart means leaning not on our own understanding but acknowledging Him in all our ways.' },
  { date: '2026-04-14', ref: 'Joshua 1:9', theme: 'Courage', reflection: 'We can be strong and courageous because the Lord our God is with us wherever we go.' },
  { date: '2026-04-15', ref: 'Lamentations 3:22-23', theme: 'Faithfulness', reflection: 'God\'s mercies never come to an end; they are new every morning. Great is His faithfulness.' },
  { date: '2026-04-16', ref: 'Hebrews 11:1', theme: 'Faith', reflection: 'Faith is the assurance of things hoped for, the conviction of things not seen.' },
  { date: '2026-04-17', ref: '1 Corinthians 13:13', theme: 'Love', reflection: 'Three things remain: faith, hope, and love. But the greatest of these is love.' },
  { date: '2026-04-18', ref: 'Galatians 5:22-23', theme: 'Fruit', reflection: 'The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.' },
  { date: '2026-04-19', ref: 'Ephesians 2:8-9', theme: 'Grace', reflection: 'For by grace you have been saved through faith. It is not your own doing; it is the gift of God.' },
  { date: '2026-04-20', ref: 'Isaiah 40:31', theme: 'Strength', reflection: 'Those who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.' },
  { date: '2026-04-21', ref: 'Micah 6:8', theme: 'Justice', reflection: 'What does the Lord require of you? To do justice, to love kindness, and to walk humbly with your God.' },
  { date: '2026-04-22', ref: 'Romans 12:2', theme: 'Transformation', reflection: 'Do not be conformed to this world, but be transformed by the renewal of your mind.' },
  { date: '2026-04-23', ref: 'Philippians 4:13', theme: 'Empowerment', reflection: 'I can do all things through him who strengthens me.' },
  { date: '2026-04-24', ref: 'Matthew 6:33', theme: 'Priorities', reflection: 'Seek first the Kingdom of God and his righteousness, and all these things will be added to you.' },
  { date: '2026-04-25', ref: 'James 1:5', theme: 'Wisdom', reflection: 'If any of you lacks wisdom, let him ask God, who gives generously to all without reproach.' },
  { date: '2026-04-26', ref: '1 Peter 5:7', theme: 'Care', reflection: 'Casting all your anxieties on him, because he cares for you.' },
  { date: '2026-04-27', ref: 'Psalm 119:105', theme: 'Illumination', reflection: 'Your word is a lamp to my feet and a light to my path.' },
  { date: '2026-04-28', ref: 'Colossians 3:23', theme: 'Work', reflection: 'Whatever you do, work heartily, as for the Lord and not for men.' },
  { date: '2026-04-29', ref: 'John 14:27', theme: 'Peace', reflection: 'Peace I leave with you; my peace I give to you. Not as the world gives do I give to you.' },
  { date: '2026-04-30', ref: 'Revelation 21:4', theme: 'Hope', reflection: 'He will wipe away every tear from their eyes, and death shall be no more.' },
  { date: '2026-05-01', ref: 'Psalm 46:1', theme: 'Refuge', reflection: 'God is our refuge and strength, a very present help in trouble.' },
  { date: '2026-05-02', ref: 'Matthew 11:28', theme: 'Rest', reflection: 'Come to me, all who labor and are heavy laden, and I will give you rest.' },
  { date: '2026-05-03', ref: '2 Timothy 1:7', theme: 'Identity', reflection: 'For God gave us a spirit not of fear but of power and love and self-control.' },
  { date: '2026-05-04', ref: 'John 8:32', theme: 'Truth', reflection: 'And you will know the truth, and the truth will set you free.' },
  { date: '2026-05-05', ref: 'Hebrews 13:8', theme: 'Constancy', reflection: 'Jesus Christ is the same yesterday and today and forever.' },
  { date: '2026-05-06', ref: 'Psalm 100:5', theme: 'Goodness', reflection: 'For the Lord is good; his steadfast love endures forever, and his faithfulness to all generations.' },
  { date: '2026-05-07', ref: 'John 15:5', theme: 'Connection', reflection: 'I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit.' },
];

export function getDailyVerse(date?: string): DailyVerse {
  const d = date || new Date().toISOString().split('T')[0];
  const verse = DAILY_VERSES.find(v => v.date === d);
  return verse || DAILY_VERSES[0]; // Fallback to first
}
