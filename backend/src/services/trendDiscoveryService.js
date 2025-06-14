// backend/src/services/trendDiscoveryService.js
const axios = require('axios');
const { getRelevanceForKeywords } = require('./KeywordAnalysisService');
const logger = require('../utils/logger');

const STOP_WORDS = [
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'if',
  'in',
  'into',
  'is',
  'it',
  'no',
  'not',
  'of',
  'on',
  'or',
  'such',
  'that',
  'the',
  'their',
  'then',
  'there',
  'these',
  'they',
  'this',
  'to',
  'was',
  'will',
  'with',
  'i',
  'me',
  'my',
  'myself',
  'we',
  'our',
  'ours',
  'ourselves',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'he',
  'him',
  'his',
  'himself',
  'she',
  'her',
  'hers',
  'herself',
  'it',
  'its',
  'itself',
  'they',
  'them',
  'their',
  'theirs',
  'themselves',
  'what',
  'which',
  'who',
  'whom',
  'this',
  'that',
  'these',
  'those',
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'doing',
  'a',
  'an',
  'the',
  'and',
  'but',
  'if',
  'or',
  'because',
  'as',
  'until',
  'while',
  'of',
  'at',
  'by',
  'for',
  'with',
  'about',
  'against',
  'between',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'to',
  'from',
  'up',
  'down',
  'in',
  'out',
  'on',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'any',
  'both',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  's',
  't',
  'can',
  'will',
  'just',
  'don',
  'should',
  'now',
  'com',
  'http',
  'https',
  'www',
  'youtube',
  'channel',
  'video',
  'videos',
  'playlist',
  'playlists',
  // Common YouTube / video related terms that might not be useful as keywords themselves
  'watch',
  'new',
  'official',
  'music',
  'trailer',
  'episode',
  'series',
  'full',
  'hd',
  'live',
  'stream',
  'highlights',
  'interview',
  'podcast',
  'review',
  'tutorial',
  'guide',
  'how',
  'best',
  'top',
  'update',
  'news',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  '2023',
  '2024',
  '2025',
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
  'like',
  'subscribe',
  'comment',
  'share',
  'follow',
  'channel',
  'description',
  'link',
  'check',
  'get',
  'free',
  'buy',
  'download',
  'learn',
  'discover',
  'explore',
  'join',
  'visit',
  'find',
  'out',
  'more',
  'info',
  'details',
  'contact',
  'us',
  'today',
  'latest',
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
    logger.info(
      `[TrendDiscoveryService] Discovering trends for topic: "${topic}" using YouTube API`
    );

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      logger.error(
        '[TrendDiscoveryService] YOUTUBE_API_KEY is not set. Returning empty trends.'
      );
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
        logger.info(
          `[TrendDiscoveryService] No YouTube trends found for topic: "${topic}"`
        );
        return [];
      }

      const discoveredTrends = items.map((item) => ({
        keyword: item.snippet.title,
        snippet:
          item.snippet.description.substring(0, 150) +
          (item.snippet.description.length > 150 ? '...' : ''), // Keep snippet concise
        source: 'YouTube',
        pubDate: item.snippet.publishedAt,
        videoId: item.id.videoId, // Useful for linking directly to the video
      }));

      logger.info(
        `[TrendDiscoveryService] Found ${discoveredTrends.length} trends from YouTube.`
      );
      return discoveredTrends;
    } catch (error) {
      logger.error(
        '[TrendDiscoveryService] Error fetching trends from YouTube API:',
        error.response
          ? typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data)
          : error.message
      );
      // Optionally, you could check for specific error types, e.g., quota exceeded
      // if (error.response && error.response.data && error.response.data.error.errors) {
      //   error.response.data.error.errors.forEach(err => console.error(`YouTube API Error: ${err.reason} - ${err.message}`));
      // }
      return []; // Return empty array on error to prevent breaking the flow
    }
  } // End of discoverTrends method

  // Private helper method for keyword extraction (to be implemented next)
  async _extractKeywordsFromVideos(videos, timeframe, topic) {
    // Added topic parameter for AI context
    logger.debug(
      `[TrendDiscoveryService] _extractKeywordsFromVideos called with ${videos.length} videos for timeframe: ${timeframe}`
    );
    const keywordMap = new Map();
    const MIN_KEYWORD_LENGTH = 3;
    const MAX_KEYWORDS_TO_RETURN = 30;

    if (videos.length === 0) {
      return [];
    }

    // Determine date range for recency weighting
    const videoDates = videos
      .map((v) => new Date(v.snippet.publishedAt))
      .filter((d) => !isNaN(d.getTime()));
    const minDate =
      videoDates.length > 0
        ? Math.min(...videoDates.map((d) => d.getTime()))
        : Date.now();
    const maxDate =
      videoDates.length > 0
        ? Math.max(...videoDates.map((d) => d.getTime()))
        : Date.now();
    const dateRange = maxDate - minDate > 0 ? maxDate - minDate : 1; // Avoid division by zero if all videos have same timestamp or only one video

    for (const video of videos) {
      if (!video.snippet || !video.id || !video.id.videoId) {
        logger.warn(
          '[TrendDiscoveryService] Skipping video due to missing snippet or videoId:',
          video
        );
        continue;
      }

      const title = video.snippet.title || '';
      const description = video.snippet.description || '';
      const combinedText = `${title} ${description}`.toLowerCase();

      // Basic tokenization: split by non-alphanumeric characters, filter out empty strings
      const tokens = combinedText
        .split(/[^a-z0-9'-]+/)
        .filter(
          (token) => token && token.length > 0 && token !== "'" && token !== '-'
        );

      const videoKeywords = new Set(); // To count each keyword once per video for source_video_count

      for (const token of tokens) {
        if (token.length >= MIN_KEYWORD_LENGTH && !STOP_WORDS.includes(token)) {
          if (!keywordMap.has(token)) {
            keywordMap.set(token, {
              count: 0,
              weighted_recency_score_sum: 0, // Sum of recency scores for this keyword
              source_videos: [], // To store { videoId, videoTitle, viewCount, publishedAt }
            });
          }
          const keywordData = keywordMap.get(token);
          // Calculate recency score for the current video (0 to 1, 1 is newest)
          const currentVideoDate = new Date(video.snippet.publishedAt);
          const recencyScore =
            videoDates.length > 0 && !isNaN(currentVideoDate.getTime())
              ? (currentVideoDate.getTime() - minDate) / dateRange
              : 0.5; // Default to 0.5 if date is invalid

          keywordData.count++;
          keywordData.weighted_recency_score_sum += recencyScore;

          // Add video details only if this keyword hasn't been processed for this video yet
          if (!videoKeywords.has(token)) {
            keywordData.source_videos.push({
              videoId: video.id.videoId,
              videoTitle: title,
              publishedAt: video.snippet.publishedAt,
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
      // Enhanced engagement score: (count * number_of_source_videos) * (average_recency_score)
      // Average recency score is weighted_recency_score_sum / count. Max 1 to prevent over-inflation.
      const averageRecency =
        data.count > 0 ? data.weighted_recency_score_sum / data.count : 0.5;
      const engagementScore =
        data.count * data.source_videos.length * (0.5 + averageRecency); // Base of 0.5 + (0 to 1), so multiplier is 0.5 to 1.5

      if (data.count > 1) {
        // Only include keywords appearing more than once
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

    const rawExtractedKeywords = extractedKeywords.slice(
      0,
      MAX_KEYWORDS_TO_RETURN
    );
    logger.info(
      `[TrendDiscoveryService] Extracted ${rawExtractedKeywords.length} raw keywords for timeframe: ${timeframe}.`
    );

    if (rawExtractedKeywords.length > 0 && topic) {
      logger.info(
        `[TrendDiscoveryService] Augmenting ${rawExtractedKeywords.length} keywords with AI relevance for topic: "${topic}"`
      );
      try {
        const keywordsWithAiRelevance = await getRelevanceForKeywords(
          rawExtractedKeywords,
          topic
        );
        logger.info(
          `[TrendDiscoveryService] Successfully augmented ${keywordsWithAiRelevance.filter((kw) => kw.aiRelevance && !kw.aiRelevance.error).length} out of ${rawExtractedKeywords.length} keywords with AI relevance.`
        );
        return keywordsWithAiRelevance;
      } catch (aiError) {
        logger.error(
          `[TrendDiscoveryService] Error during AI relevance augmentation: ${aiError.message}. Returning raw keywords.`
        );
        // Return raw keywords but mark them as having failed AI augmentation
        return rawExtractedKeywords.map((kw) => ({
          ...kw,
          aiRelevance: { error: `AI augmentation failed: ${aiError.message}` },
        }));
      }
    } else {
      if (!topic) {
        logger.warn(
          `[TrendDiscoveryService] Topic not provided to _extractKeywordsFromVideos. Skipping AI relevance for ${rawExtractedKeywords.length} keywords.`
        );
      }
      logger.info(
        `[TrendDiscoveryService] No keywords to augment or topic missing. Returning ${rawExtractedKeywords.length} raw keywords without AI relevance.`
      );
      // Return raw keywords, explicitly noting no AI relevance was attempted or possible
      return rawExtractedKeywords.map((kw) => ({ ...kw, aiRelevance: null }));
    }
  }

  async getYouTubeKeywordsByTopicAndTimeframe(
    topic,
    timeframe = 'any',
    publishedAfterISO = null,
    publishedBeforeISO = null
  ) {
    logger.info(
      `[TrendDiscoveryService] Getting YouTube keywords for topic: "${topic}", timeframe: "${timeframe}"`
    );

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      logger.error(
        '[TrendDiscoveryService] YOUTUBE_API_KEY is not set. Returning empty keywords.'
      );
      return [];
    }

    const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
      part: 'snippet',
      q: topic, // Using the raw topic for now, can be broadened if needed
      type: 'video',
      order: 'viewCount',
      maxResults: 25, // Fetch more videos for better keyword analysis
      key: apiKey,
    };

    let effectiveTimeframeLabel = timeframe;

    if (publishedAfterISO) {
      try {
        new Date(publishedAfterISO).toISOString(); // Validate format
        params.publishedAfter = publishedAfterISO;
        effectiveTimeframeLabel = 'custom'; // Indicate a custom range was used
        logger.debug(
          `[TrendDiscoveryService] Applying custom publishedAfter filter: ${params.publishedAfter}`
        );
      } catch (e) {
        logger.warn(
          `[TrendDiscoveryService] Invalid publishedAfterISO format: ${publishedAfterISO}. Ignoring.`
        );
      }
    }
    if (publishedBeforeISO) {
      try {
        new Date(publishedBeforeISO).toISOString(); // Validate format
        params.publishedBefore = publishedBeforeISO;
        effectiveTimeframeLabel = 'custom'; // Indicate a custom range was used
        logger.debug(
          `[TrendDiscoveryService] Applying custom publishedBefore filter: ${params.publishedBefore}`
        );
      } catch (e) {
        logger.warn(
          `[TrendDiscoveryService] Invalid publishedBeforeISO format: ${publishedBeforeISO}. Ignoring.`
        );
      }
    }

    // Only apply fixed timeframe logic if custom dates weren't provided or were invalid for publishedAfter
    if (
      timeframe !== 'any' &&
      !params.publishedAfter &&
      !params.publishedBefore
    ) {
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
        const publishedAfterDate = new Date(
          now.getTime() - hoursToSubtract * 60 * 60 * 1000
        );
        params.publishedAfter = publishedAfterDate.toISOString();
        logger.debug(
          `[TrendDiscoveryService] Applying publishedAfter filter: ${params.publishedAfter}`
        );
      }
    }

    try {
      logger.debug(
        `[TrendDiscoveryService] Calling YouTube API with params: ${JSON.stringify(params)}`
      );
      const response = await axios.get(searchUrl, { params });
      const items = response.data.items || [];

      if (items.length === 0) {
        logger.info(
          `[TrendDiscoveryService] No YouTube videos found for topic: "${topic}" with timeframe: "${timeframe}"`
        );
        return [];
      }

      logger.info(
        `[TrendDiscoveryService] Found ${items.length} videos from YouTube for keyword extraction.`
      );
      // Pass videos to the extraction helper
      // Pass the effectiveTimeframeLabel to _extractKeywordsFromVideos for context
      const finalKeywords = await this._extractKeywordsFromVideos(
        items,
        effectiveTimeframeLabel,
        topic
      );

      return finalKeywords;
    } catch (error) {
      logger.error(
        '[TrendDiscoveryService] Error fetching videos from YouTube API for keyword extraction:',
        error.response ? JSON.stringify(error.response.data) : error.message
      );
      return [];
    }
  }
} // End of TrendDiscoveryService class

module.exports = new TrendDiscoveryService();
