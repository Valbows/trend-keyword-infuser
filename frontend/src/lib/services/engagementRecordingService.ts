// G.O.A.T. C.O.D.E.X. B.O.T. - Migrated and Enhanced EngagementRecordingService
// 'Durable', 'Optimized', and 'Xtensible' TypeScript implementation for recording YouTube engagement.

import { youTubeDataService } from './youTubeDataService';
import { scriptService } from './scriptService';

class EngagementRecordingService {
  /**
   * 'Clairvoyant' orchestration of recording YouTube video engagement for a script.
   * @param scriptId The ID of the script to update.
   * @param videoUrl The URL of the published YouTube video.
   * @returns A promise that resolves to the updated script object.
   */
  async recordEngagement(scriptId: number, videoUrl: string) {
    if (!youTubeDataService) {
      const errorMessage = 'YouTube Data Service is not available. Please check API key configuration.';
      console.error(`[EngagementService] ${errorMessage}`);
      throw new Error(errorMessage);
    }
    console.info(`[EngagementService] Starting engagement recording for script ID: ${scriptId}`);

    // Step 1: Extract Video ID
    const videoId = youTubeDataService.extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      console.error(`[EngagementService] Invalid or unsupported YouTube URL: ${videoUrl}`);
      throw new Error('Invalid YouTube URL provided.');
    }

    // Step 2: Fetch Video Statistics
    const stats = await youTubeDataService.getVideoStatistics(videoId);

    // Step 3: Calculate Engagement Rate (as a simple example)
    const engagementRate = (stats.likes + stats.comments) / stats.views;

    // Step 4: Persist the data
    const updatePayload = {
      published_video_id: videoId,
      views: stats.views,
      likes: stats.likes,
      comments: stats.comments,
      engagement_rate: isNaN(engagementRate) ? 0 : engagementRate,
      engagement_retrieved_at: new Date().toISOString(),
    };

    const updatedScript = await scriptService.updateScript(scriptId, updatePayload);
    console.info(`[EngagementService] Successfully recorded engagement for script ID: ${scriptId}`);

    return updatedScript;
  }
}

export const engagementRecordingService = new EngagementRecordingService();
