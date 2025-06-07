// backend/src/services/trendDiscoveryService.js
const axios = require('axios');
const logger = require('../utils/logger');

const STOP_WORDS = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 
  'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', 'i', 'me', 'my', 'myself', 'we', 'our', 
  'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 
  'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 
  'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 
  'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 
  'can', 'will', 'just', 'don', 'should', 'now', 'com', 'http', 'https', 'www','youtube','channel','video','videos','playlist','playlists',
  // Common YouTube / video related terms that might not be useful as keywords themselves
  'watch', 'new', 'official', 'music', 'trailer', 'episode', 'series', 'full', 'hd', 'live', 'stream', 'highlights', 'interview', 'podcast',
  'review', 'tutorial', 'guide', 'how', 'best', 'top', 'update', 'news', 'daily', 'weekly', 'monthly', 'yearly', '2023', '2024', '2025',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
  'like', 'subscribe', 'comment', 'share', 'follow', 'channel', 'description', 'link', 'check', 'get', 'free', 'buy', 'download',
  'learn', 'discover', 'explore', 'join', 'visit', 'find', 'out', 'more', 'info', 'details', 'contact', 'us', 'today', 'latest'
];

// In the future, this service will integrate with external APIs like YouTube Data API,
// Google Trends, news APIs, etc., to dynamically fetch and process trends.


class TrendDiscoveryService {
  /**
   * Discovers relevant trends for a given topic.
   * Placeholder implementation: returns a static list of trends.
   * @param {string} topic - The topic to discover trends for.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of trend objects.
   * Each trend object should ideally have: { keyword: string, snippet: string, source: string, pubDate: string (ISO) }
   */
  async discoverTrends(topic) {
    logger.info(`[TrendDiscoveryService] Discovering trends for topic: "${topic}" using YouTube API`);

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      logger.error('[TrendDiscoveryService] YOUTUBE_API_KEY is not set. Returning empty trends.');
      return Promise.resolve([]);
    }

    const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
      part: 'snippet',
      q: `${topic} trends news tutorial how-to`, // Broaden search query for better results
      type: 'video',
      order: 'relevance', // relevance or viewCount
      maxResults: 5, // Fetch 5 trends
      key: apiKey,
    };

    try {
      const response = await axios.get(searchUrl, { params });
      const items = response.data.items || [];

      if (items.length === 0) {
        logger.info(`[TrendDiscoveryService] No YouTube trends found for topic: "${topic}"`);
        return [];
      }

      const discoveredTrends = items.map((item) => ({
        keyword: item.snippet.title,
        snippet: item.snippet.description.substring(0, 150) + (item.snippet.description.length > 150 ? '...' : ''), // Keep snippet concise
        source: 'YouTube',
        pubDate: item.snippet.publishedAt,
        videoId: item.id.videoId, // Useful for linking directly to the video
      }));

      logger.info(`[TrendDiscoveryService] Found ${discoveredTrends.length} trends from YouTube.`);
      return discoveredTrends;
    } catch (error) {
      logger.error('[TrendDiscoveryService] Error fetching trends from YouTube API:', error.response ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)) : error.message);
      // Optionally, you could check for specific error types, e.g., quota exceeded
      // if (error.response && error.response.data && error.response.data.error.errors) {
      //   error.response.data.error.errors.forEach(err => console.error(`YouTube API Error: ${err.reason} - ${err.message}`));
      // }
      return []; // Return empty array on error to prevent breaking the flow
    }
  } // End of discoverTrends method

  // Private helper method for keyword extraction (to be implemented next)
  _extractKeywordsFromVideos(videos, timeframe) {
    logger.debug(`[TrendDiscoveryService] _extractKeywordsFromVideos called with ${videos.length} videos for timeframe: ${timeframe}`);
    const keywordMap = new Map();
    const MIN_KEYWORD_LENGTH = 3;
    const MAX_KEYWORDS_TO_RETURN = 30;

    for (const video of videos) {
      if (!video.snippet || !video.id || !video.id.videoId) {
        logger.warn('[TrendDiscoveryService] Skipping video due to missing snippet or videoId:', video);
        continue;
      }

      const title = video.snippet.title || '';
      const description = video.snippet.description || '';
      const combinedText = `${title} ${description}`.toLowerCase();
      
      // Basic tokenization: split by non-alphanumeric characters, filter out empty strings
      const tokens = combinedText.split(/[^a-z0-9'-]+/).filter(token => token && token.length > 0 && token !== "'" && token !== "-");

      const videoKeywords = new Set(); // To count each keyword once per video for source_video_count

      for (const token of tokens) {
        if (token.length >= MIN_KEYWORD_LENGTH && !STOP_WORDS.includes(token)) {
          if (!keywordMap.has(token)) {
            keywordMap.set(token, {
              count: 0,
              total_view_count: 0, // Sum of view counts of videos containing this keyword
              source_videos: [] // To store { videoId, videoTitle, viewCount }
            });
          }
          const keywordData = keywordMap.get(token);
          keywordData.count++;
          
          // Add video details only if this keyword hasn't been processed for this video yet
          if (!videoKeywords.has(token)) {
            // Attempt to get view count - requires another API call per video or fetching stats initially
            // For MVP, we'll rely on the initial search order ('viewCount') and assume popular videos appear first.
            // A proper viewCount would require fetching video statistics.
            // Let's placeholder viewCount for now or use a proxy like order in results.
            // For now, we won't have individual video view counts here unless fetched separately.
            // We will use a simplified engagement score later.
            keywordData.source_videos.push({
              videoId: video.id.videoId,
              videoTitle: title,
              // viewCount: video.statistics ? video.statistics.viewCount : 0 // Ideal, but needs stats part
            });
            videoKeywords.add(token);
          }
        }
      }
    }

    const extractedKeywords = [];
    for (const [keyword, data] of keywordMap.entries()) {
      // Simplified engagement score: higher count and more source videos are better.
      // A more sophisticated score could weigh recency, view velocity, like/comment ratio etc.
      // For now, let's use (count * number_of_source_videos) as a proxy.
      // The `order: 'viewCount'` in the main API call already prioritizes high-view videos.
      const engagementScore = data.count * data.source_videos.length;

      if (data.count > 1) { // Only include keywords appearing more than once
        extractedKeywords.push({
          keyword: keyword,
          engagement_score: engagementScore, // Placeholder, real engagement needs video stats
          source_video_count: data.source_videos.length,
          timeframe: timeframe,
          // source_videos: data.source_videos // Optionally include source videos
        });
      }
    }

    // Sort by engagement_score descending
    extractedKeywords.sort((a, b) => b.engagement_score - a.engagement_score);
    
    const finalKeywords = extractedKeywords.slice(0, MAX_KEYWORDS_TO_RETURN);
    logger.info(`[TrendDiscoveryService] Extracted ${finalKeywords.length} keywords for timeframe: ${timeframe}.`);
    return finalKeywords;
  }

  async getYouTubeKeywordsByTopicAndTimeframe(topic, timeframe = 'any') {
    logger.info(`[TrendDiscoveryService] Getting YouTube keywords for topic: "${topic}", timeframe: "${timeframe}"`);

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      logger.error('[TrendDiscoveryService] YOUTUBE_API_KEY is not set. Returning empty keywords.');
      return [];
    }

    const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
      part: 'snippet',
      q: topic, // Using the raw topic for now, can be broadened if needed
      type: 'video',
      order: 'viewCount', 
      maxResults: 25, // Fetch more videos for better keyword analysis
      key: apiKey
    };

    if (timeframe !== 'any') {
      const now = new Date();
      let hoursToSubtract = 0;
      if (timeframe === '24h') {
        hoursToSubtract = 24;
      } else if (timeframe === '48h') {
        hoursToSubtract = 48;
      } else if (timeframe === '72h') {
        hoursToSubtract = 72;
      }
      
      if (hoursToSubtract > 0) {
        const publishedAfterDate = new Date(now.getTime() - hoursToSubtract * 60 * 60 * 1000);
        params.publishedAfter = publishedAfterDate.toISOString();
        logger.debug(`[TrendDiscoveryService] Applying publishedAfter filter: ${params.publishedAfter}`);
      }
    }

    try {
      logger.debug(`[TrendDiscoveryService] Calling YouTube API with params: ${JSON.stringify(params)}`);
      const response = await axios.get(searchUrl, { params });
      const items = response.data.items || [];

      if (items.length === 0) {
        logger.info(`[TrendDiscoveryService] No YouTube videos found for topic: "${topic}" with timeframe: "${timeframe}"`);
        return [];
      }

      logger.info(`[TrendDiscoveryService] Found ${items.length} videos from YouTube for keyword extraction.`);
      // Pass videos to the extraction helper
      return this._extractKeywordsFromVideos(items, timeframe);
      
    } catch (error) {
      logger.error('[TrendDiscoveryService] Error fetching videos from YouTube API for keyword extraction:', error.response ? JSON.stringify(error.response.data) : error.message);
      return []; 
    }
  }
} // End of TrendDiscoveryService class

module.exports = new TrendDiscoveryService();
