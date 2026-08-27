import { BibleClient, ApiClient, YouVersionPlatformConfiguration } from '@youversion/platform-core';

// Configure the core SDK
const apiKey = process.env.EXPO_PUBLIC_YOUVERSION_API_KEY || '';
let bibleClient: BibleClient | null = null;

if (apiKey) {
  try {
    YouVersionPlatformConfiguration.appKey = apiKey;
    const apiClient = new ApiClient({ appKey: apiKey });
    bibleClient = new BibleClient(apiClient);
  } catch (error) {
    console.log('[YouVersion] Failed to initialize client:', error);
  }
}

export { bibleClient };

export async function getVerseOfTheDay() {
  if (!bibleClient) {
    console.log('[YouVersion] API not configured - add EXPO_PUBLIC_YOUVERSION_API_KEY to .env');
    return null;
  }

  try {
    const today = new Date();
    // getDay() gives 0-6. We need day of year.
    // Better: calculate day of the year:
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const votd = await bibleClient.getVOTD(dayOfYear);
    return votd;
  } catch (error) {
    console.error('Failed to fetch Verse of the Day', error);
    return null;
  }
}

export async function getVerseOfTheDayText(versionId: number) {
  if (!bibleClient) return null;

  try {
    const votd = await getVerseOfTheDay();
    if (!votd) return null;

    // getPassage takes versionId, usfm (which is the passage_id from VOTD)
    const passage = await bibleClient.getPassage(versionId, votd.passage_id, 'text');
    return {
      reference: passage.reference, // e.g. "John 3:16"
      text: passage.content,
      usfm: votd.passage_id
    };
  } catch (error) {
    console.error('Failed to fetch Verse of the Day Text', error);
    return null;
  }
}

export async function getBibleVersions() {
  if (!bibleClient) return [];

  try {
    const versions = await bibleClient.getVersions('eng');
    return versions.data;
  } catch (error) {
    console.error('Failed to fetch Bible versions', error);
    return [];
  }
}
