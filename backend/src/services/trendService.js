require('dotenv').config();
const axios = require('axios');
const Parser = require('rss-parser');
const { google } = require('googleapis');

const parser = new Parser();
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Will be used later for script generation

const GOOGLE_TRENDS_RSS_URL_US =
  'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US';

// Helper function to get YouTube client; ensures API key is checked at call time
const getYoutubeClient = () => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return null;
  }
  return google.youtube({
    version: 'v3',
    auth: apiKey,
  });
};

/**
 * Fetches trends from Google Trends RSS feed.
 * @param {string} topic - The topic to search trends for (currently used for logging, can be used for filtering later).
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of trend objects from Google Trends.
 */
const fetchGoogleTrends = async (topic) => {
  console.log(`Fetching Google Trends for topic: ${topic}`);
  try {
    const feed = await parser.parseURL(GOOGLE_TRENDS_RSS_URL_US);
    if (!feed.items) {
      console.warn('Google Trends RSS feed did not return items.');
      return [];
    }
    return feed.items.map((item) => ({
      source: 'Google Trends',
      keyword: item.title,
      link: item.link,
      pubDate: item.pubDate,
      snippet: item.contentSnippet || item.content, // Some feeds use contentSnippet, others content
    }));
  } catch (error) {
    console.error(
      'Error fetching or parsing Google Trends RSS:',
      error.message
    );
    // It's important not to let one source failure bring down the whole service if possible
    return []; // Return empty array on error for this source
  }
};

/**
 * Fetches trending videos from YouTube based on a topic.
 * @param {string} topic - The topic to search trending videos for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of trend objects from YouTube.
 */
const fetchYouTubeTrends = async (topic) => {
  console.log(`Fetching YouTube trends for topic: ${topic}`);
  const youtubeClient = getYoutubeClient();

  if (!youtubeClient) {
    console.warn(
      'YouTube API Key is not configured or client could not be initialized. Skipping YouTube trends.'
    );
    return [];
  }

  try {
    const response = await youtubeClient.search.list({
      part: 'snippet',
      q: `${topic} trending`, // Append 'trending' to focus the search
      type: 'video',
      order: 'viewCount', // Order by view count to find popular videos
      maxResults: 5, // Limit to 5 results for MVP
      regionCode: 'US', // Focus on US region for now
      relevanceLanguage: 'en',
    });

    if (!response.data.items) {
      console.warn('YouTube API did not return items for topic:', topic);
      return [];
    }

    return response.data.items.map((item) => ({
      source: 'YouTube',
      keyword: item.snippet.title,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      pubDate: item.snippet.publishedAt,
      snippet: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
    }));
  } catch (error) {
    console.error(
      `Error fetching YouTube trends for topic "${topic}":`,
      error.message
    );
    // Check for specific API errors, e.g., quota exceeded
    if (error.response && error.response.data && error.response.data.error) {
      console.error(
        'YouTube API Error Details:',
        JSON.stringify(error.response.data.error.errors)
      );
    }
    return []; // Return empty array on error for this source
  }
};

/**
 * Fetches trends based on the given topic from various sources.
 * @param {string} topic - The topic to search trends for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of trend objects.
 */
const fetchTrendsFromSources = async (topic) => {
  console.log(`Fetching all trends for topic: ${topic} in trendService`);
  try {
    const googleTrendsPromise = fetchGoogleTrends(topic);
    const youtubeTrendsPromise = fetchYouTubeTrends(topic);

    // Concurrently fetch from all sources
    const [googleTrends, youtubeTrends] = await Promise.all([
      googleTrendsPromise,
      youtubeTrendsPromise,
    ]);

    return [...googleTrends, ...youtubeTrends];
  } catch (error) {
    console.error(
      'Error in trendService fetching trends from sources:',
      error.message
    );
    throw new Error('Failed to fetch trends from aggregated sources');
  }
};

module.exports = {
  fetchTrendsFromSources,
};
