// G.O.A.T. C.O.D.E.X. B.O.T. - Migrated and Enhanced YouTubeDataService
// 'Durable', 'Optimized', and 'Xtensible' TypeScript implementation.

import { google, youtube_v3 } from 'googleapis';

// 'Elegant' interface for video statistics
interface VideoStatistics {
  views: number;
  likes: number;
  comments: number;
}

class YouTubeDataService {
  private youtube: youtube_v3.Youtube;

  constructor(apiKey: string) {
    if (!apiKey) {
      const errorMessage =
        'FATAL: YOUTUBE_API_KEY is not configured. The service cannot operate.';
      console.error(`[YouTubeDataService] ${errorMessage}`);
      throw new Error(errorMessage);
    }
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
    console.info('[YouTubeDataService] Service initialized successfully.');
  }

  /**
   * 'Elegant' and 'Xtensible' method to extract a YouTube video ID from various URL formats.
   * @param {string} url The YouTube URL.
   * @returns {string|null} The extracted video ID or null if not found.
   */
  public extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const regex =
      /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    const videoId = match ? match[1] : null;
    console.info(
      `[YouTubeDataService] Extracted videoId: ${videoId} from URL: ${url}`
    );
    return videoId;
  }

  /**
   * 'Boundless' method to fetch video statistics from the YouTube Data API.
   * @param {string} videoId The ID of the YouTube video.
   * @returns {Promise<VideoStatistics>} A promise that resolves with the video statistics.
   */
  /**
   * 'Boundless' method to search for videos on YouTube.
   * @param query The search query.
   * @param maxResults The maximum number of results to return.
   * @param publishedAfter Optional ISO 8601 date string.
   * @param publishedBefore Optional ISO 8601 date string.
   * @returns A promise that resolves with an array of search results.
   */
  public async searchVideos(
    query: string,
    maxResults: number,
    publishedAfter?: string,
    publishedBefore?: string
  ): Promise<youtube_v3.Schema$SearchResult[]> {
    console.info(
      `[YouTubeDataService] Searching for videos with query: "${query}"`
    );
    try {
      const params: youtube_v3.Params$Resource$Search$List = {
        part: ['snippet'],
        q: query,
        type: ['video'],
        order: 'viewCount', // Prioritize popular videos
        maxResults: maxResults,
        publishedAfter: publishedAfter,
        publishedBefore: publishedBefore,
      };

      const response = await this.youtube.search.list(params);

      const items = response.data.items;
      if (!items) {
        console.warn(
          `[YouTubeDataService] No videos found for query: "${query}"`
        );
        return [];
      }

      console.info(
        `[YouTubeDataService] Found ${items.length} videos for query: "${query}"`
      );
      return items;
    } catch (error: unknown) {
      console.error(
        `[YouTubeDataService] CRITICAL ERROR searching for videos with query "${query}".`
      );
      console.error(
        '[YouTubeDataService] Full Google API Error:',
        JSON.stringify(error, null, 2)
      );
      let errorMessage;
      if (error instanceof Error) {
        // The googleapis library can throw errors with a 'response' property.
        // This is a 'Durable' way to check for a more specific error message.
        const response = (error as { response?: unknown }).response;
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          response.data &&
          typeof response.data === 'object' &&
          'error' in response.data &&
          response.data.error &&
          typeof response.data.error === 'object' &&
          'message' in response.data.error &&
          typeof (response.data.error as { message: unknown }).message ===
            'string'
        ) {
          errorMessage = (response.data.error as { message: string }).message;
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage =
          'An unknown error occurred while contacting the YouTube API.';
      }
      throw new Error(`YouTube API Error: ${errorMessage}`);
    }
  }

  public async getVideoStatistics(videoId: string): Promise<VideoStatistics> {
    if (!videoId) {
      throw new Error('Invalid videoId provided to getVideoStatistics.');
    }

    console.info(
      `[YouTubeDataService] Fetching statistics for videoId: ${videoId}`
    );

    try {
      const response = await this.youtube.videos.list({
        part: ['statistics'],
        id: [videoId],
      });

      const items = response.data.items;
      if (!items || items.length === 0) {
        throw new Error(`No video found with ID: ${videoId}`);
      }

      const stats = items[0].statistics;
      if (!stats) {
        throw new Error(`Statistics not found for video ID: ${videoId}`);
      }

      console.info(
        `[YouTubeDataService] Successfully fetched stats for videoId ${videoId}:`,
        stats
      );
      return {
        views: parseInt(stats.viewCount || '0', 10),
        likes: parseInt(stats.likeCount || '0', 10),
        comments: parseInt(stats.commentCount || '0', 10),
      };
    } catch (error: unknown) {
      // 'Clairvoyant' and 'Omniscient' logging for durable error diagnostics.
      console.error(
        `[YouTubeDataService] CRITICAL ERROR fetching video statistics for ID ${videoId}.`
      );
      console.error(
        '[YouTubeDataService] Full Google API Error:',
        JSON.stringify(error, null, 2)
      );
      let errorMessage;
      if (error instanceof Error) {
        // The googleapis library can throw errors with a 'response' property.
        // This is a 'Durable' way to check for a more specific error message.
        const response = (error as { response?: unknown }).response;
        if (
          response &&
          typeof response === 'object' &&
          'data' in response &&
          response.data &&
          typeof response.data === 'object' &&
          'error' in response.data &&
          response.data.error &&
          typeof response.data.error === 'object' &&
          'message' in response.data.error &&
          typeof (response.data.error as { message: unknown }).message ===
            'string'
        ) {
          errorMessage = (response.data.error as { message: string }).message;
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage =
          'An unknown error occurred while contacting the YouTube API.';
      }
      throw new Error(`YouTube API Error: ${errorMessage}`);
    }
  }
}

// 'Altruistic' Singleton Pattern: Ensures a single, configured instance throughout the application.
const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) {
  console.warn(
    '[YouTubeDataService] YOUTUBE_API_KEY is not set. Service will not be available.'
  );
}

// Export the instance, which may be null if the API key is not provided.
export const youTubeDataService = apiKey
  ? new YouTubeDataService(apiKey)
  : null;
