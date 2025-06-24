const supabase = require('../config/supabaseClient');
const youTubeDataService = require('./youTubeDataService');
const logger = require('../utils/logger');

/**
 * Orchestrates the recording of YouTube video engagement statistics for a script.
 * This service is 'Clairvoyant', handling the entire workflow from URL parsing to database persistence.
 */
class EngagementRecordingService {
  /**
   * Records engagement for a given script by fetching data from a YouTube URL.
   * @param {string} scriptId - The UUID of the script to update.
   * @param {string} youtubeUrl - The URL of the published YouTube video.
   * @returns {Promise<{data: object, error: object|null}>} - A promise that resolves to the updated script data or an error object.
   */
  async recordEngagement(scriptId, youtubeUrl) {
    logger.info(`[EngagementService] Starting engagement recording for scriptId: ${scriptId}`);

    // 1. 'Tactical' Input Validation
    if (!scriptId || !youtubeUrl) {
      const errorMsg = 'Script ID and YouTube URL are required.';
      logger.error(`[EngagementService] Validation failed: ${errorMsg}`);
      return { data: null, error: { message: errorMsg, status: 400 } };
    }

    try {
      // 2. 'Optimized' Video ID Extraction
      const videoId = youTubeDataService.extractYouTubeVideoId(youtubeUrl);
      if (!videoId) {
        const errorMsg = 'Invalid YouTube URL provided. Could not extract video ID.';
        logger.warn(`[EngagementService] ${errorMsg}`);
        return { data: null, error: { message: errorMsg, status: 400 } };
      }

      // 3. 'Boundless' Statistics Fetching
      const stats = await youTubeDataService.getVideoStatistics(videoId);
      if (!stats) {
        const errorMsg = 'Could not retrieve video statistics from YouTube. The video may be private, deleted, or have stats disabled.';
        logger.warn(`[EngagementService] ${errorMsg}`);
        return { data: null, error: { message: errorMsg, status: 404 } };
      }

      // 4. 'Elegant' Engagement Rate Calculation
      const { views, likes, comments } = stats;
      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

      // 5. 'Durable' Database Update
      const updates = {
        published_video_id: videoId,
        views: views,
        likes: likes,
        comments: comments,
        engagement_rate: parseFloat(engagementRate.toFixed(2)), // Store as a float for precision
        engagement_retrieved_at: new Date().toISOString(),
      };

      logger.debug(`[EngagementService] Updating script ${scriptId} with engagement data:`, updates);

      // 'Clairvoyant' Conflict Resolution: Handle unique constraint on published_video_id
      // First, clear any existing assignments of this video ID to other scripts
      logger.debug(`[EngagementService] Clearing existing assignments for videoId: ${videoId}`);
      await supabase
        .from('scripts')
        .update({ published_video_id: null })
        .eq('published_video_id', videoId)
        .neq('id', scriptId); // Don't clear the current script if it already has this video ID

      // Now perform the update for the current script
      const { data, error } = await supabase
        .from('scripts')
        .update(updates)
        .eq('id', scriptId)
        .select()
        .single(); // Use .single() to get a single object back instead of an array

      if (error) {
        logger.error(`[EngagementService] Supabase update error for scriptId ${scriptId}:`, error);
        throw error; // Let the catch block handle it
      }

      if (!data) {
          const errorMsg = `Script with ID ${scriptId} not found for update.`;
          logger.error(`[EngagementService] ${errorMsg}`);
          return { data: null, error: { message: errorMsg, status: 404 } };
      }

      logger.info(`[EngagementService] Successfully recorded engagement for scriptId: ${scriptId}`);
      return { data, error: null };

    } catch (error) {
      const errorMsg = `An unexpected error occurred while recording engagement for scriptId ${scriptId}.`;
      logger.error(`[EngagementService] ${errorMsg}`, error);
      return { data: null, error: { message: errorMsg, status: 500 } };
    }
  }
}

module.exports = new EngagementRecordingService();
