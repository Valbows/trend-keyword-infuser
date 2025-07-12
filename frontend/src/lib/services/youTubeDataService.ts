// G.O.A.T. C.O.D.E.X. B.O.T. - Refactored YouTubeDataService
// 'Durable' and 'Optimized' for providing reliable YouTube API interactions.

import { google, youtube_v3 } from 'googleapis';

class YouTubeDataService {
  private youtube: youtube_v3.Youtube;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.error('[YouTubeDataService] YOUTUBE_API_KEY is not set. Service will not function.');
    }
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.apiKey,
    });
  }

  public getYoutubeClient(): youtube_v3.Youtube {
    return this.youtube;
  }

  public calculateEngagementScore(stats: youtube_v3.Schema$VideoStatistics | undefined | null): number {
    if (!stats) return 0;
    const viewCount = parseInt(stats.viewCount || '0', 10);
    const likeCount = parseInt(stats.likeCount || '0', 10);
    const commentCount = parseInt(stats.commentCount || '0', 10);
    if (viewCount === 0) return 0;
    return ((likeCount + commentCount) / viewCount) * 1000; // Engagement per 1000 views
  }

  public calculateRecencyScore(publishedAt: string | undefined | null): number {
    if (!publishedAt) return 0;
    const publishedDate = new Date(publishedAt);
    const now = new Date();
    const ageInHours = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
    // Use an inverse function for recency, score is higher for newer videos. Capped at 1.
    return Math.max(0, 1 - ageInHours / (30 * 24)); // Normalize over a 30-day period
  }

  async searchTrendingVideos(
    topic: string,
    maxResults = 50,
    publishedAfter?: string,
    publishedBefore?: string
  ): Promise<youtube_v3.Schema$Video[]> {
    if (!this.apiKey) {
        console.error('[YouTubeDataService] Cannot search videos, API key not configured.');
        return [];
    }

    try {
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: `${topic} tutorial`, // Add 'tutorial' to focus the search
        type: ['video'],
        videoDefinition: 'high',
        maxResults,
        order: 'relevance', // Start with relevance to find good topic matches
        publishedAfter,
        publishedBefore,
      });

      const videoIds = searchResponse.data.items
        ?.map(item => item.id?.videoId)
        .filter((id): id is string => !!id);

      if (!videoIds || videoIds.length === 0) {
        console.warn(`[YouTubeDataService] No videos found for topic: "${topic}"`);
        return [];
      }

      const videoDetailsResponse = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
        maxResults,
      });

      return videoDetailsResponse.data.items || [];
    } catch (error) {
      console.error(`[YouTubeDataService] Error fetching trending videos for topic "${topic}":`, error);
      // In case of error, return an empty array to prevent downstream crashes
      return [];
    }
  }

  public extractYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async getVideoStatistics(
    videoId: string
  ): Promise<{ views: number; likes: number; comments: number }> {
    if (!this.apiKey) {
      console.error('[YouTubeDataService] Cannot get stats, API key not configured.');
      throw new Error('YouTube API key not configured.');
    }

    try {
      const response = await this.youtube.videos.list({
        part: ['statistics'],
        id: [videoId],
      });

      const stats = response.data.items?.[0]?.statistics;
      if (!stats) {
        throw new Error('Video statistics not found.');
      }

      return {
        views: parseInt(stats.viewCount || '0', 10),
        likes: parseInt(stats.likeCount || '0', 10),
        comments: parseInt(stats.commentCount || '0', 10),
      };
    } catch (error) {
      console.error(`[YouTubeDataService] Error fetching video statistics for ID "${videoId}":`, error);
      throw new Error('Failed to fetch video statistics.');
    }
  }
}

export const youTubeDataService = new YouTubeDataService();
