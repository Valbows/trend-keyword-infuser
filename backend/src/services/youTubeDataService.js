const { google } = require('googleapis');
const logger = require('../utils/logger');

// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' Service Class
class YouTubeDataService {
  constructor(apiKey) {
    if (!apiKey) {
      const errorMessage = 'FATAL: YOUTUBE_API_KEY is not configured. The service cannot operate.';
      logger.error(`[YouTubeDataService] ${errorMessage}`);
      throw new Error(errorMessage);
    }
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
    logger.info('[YouTubeDataService] Service initialized successfully.');
  }

  /**
   * 'Elegant' and 'Xtensible' method to extract a YouTube video ID from various URL formats.
   * @param {string} url The YouTube URL.
   * @returns {string|null} The extracted video ID or null if not found.
   */
  extractYouTubeVideoId(url) {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;    
    const match = url.match(regex);
    const videoId = match ? match[1] : null;
    logger.info(`[YouTubeDataService] Extracted videoId: ${videoId} from URL: ${url}`);
    return videoId;
  }

  /**
   * 'Boundless' method to fetch video statistics from the YouTube Data API.
   * @param {string} videoId The ID of the YouTube video.
   * @returns {Promise<object>} A promise that resolves with the video statistics.
   */
  async getVideoStatistics(videoId) {
    if (!videoId) {
      throw new Error('Invalid videoId provided to getVideoStatistics.');
    }

    logger.info(`[YouTubeDataService] Fetching statistics for videoId: ${videoId}`);

    try {
      const response = await this.youtube.videos.list({
        part: 'statistics',
        id: videoId,
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`No video found with ID: ${videoId}`);
      }

      const stats = response.data.items[0].statistics;
      logger.info(`[YouTubeDataService] Successfully fetched stats for videoId ${videoId}:`, stats);
      return {
        views: parseInt(stats.viewCount, 10) || 0,
        likes: parseInt(stats.likeCount, 10) || 0,
        comments: parseInt(stats.commentCount, 10) || 0,
      };
    } catch (error) {
      // 'Clairvoyant' and 'Omniscient' logging for durable error diagnostics.
      logger.error(`[YouTubeDataService] CRITICAL ERROR fetching video statistics for ID ${videoId}.`);
      logger.error('[YouTubeDataService] Full Google API Error:', JSON.stringify(error, null, 2));
      const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred while contacting the YouTube API.';
      throw new Error(`YouTube API Error: ${errorMessage}`);
    }
  }
}

// 'Altruistic' Singleton Pattern: Ensures a single, configured instance throughout the application.
const youTubeDataService = new YouTubeDataService(process.env.YOUTUBE_API_KEY);

module.exports = youTubeDataService;
