// S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T. - Resilient TrendDiscoveryService
// 'Durable' and 'Fortified' with persistent caching and improved data handling.

import { youtube_v3 } from 'googleapis';
import { redisCacheClient } from './redisCacheClient'; // S.A.F.E. - Replaced NodeCache with Resilient Redis client
import { youTubeDataService } from './youTubeDataService';
import {
  getRelevanceForKeywords,
  KeywordInput,
  AIRelevance,
} from './keywordAnalysisService';

// --- Interfaces ---
export interface YouTubeKeywordTrend {
  keyword: string;
  engagement_score: number;
  weighted_recency_score: number;
  source_video_count: number;
  aiRelevance: AIRelevance;
  timeframe: string;
}

class TrendDiscoveryService {
  private youtube: youtube_v3.Youtube;

  constructor() {
    this.youtube = youTubeDataService.getYoutubeClient();
  }

  // 'Fortified' method to safely extract keywords from video data
  private extractKeywords(videos: youtube_v3.Schema$Video[]): KeywordInput[] {
    if (!Array.isArray(videos) || videos.length === 0) {
      return []; // Return empty array if no videos
    }

    const keywordMap = new Map<
      string,
      { count: number; totalEngagement: number; totalRecency: number }
    >();

    videos.forEach((video) => {
      const title = video.snippet?.title || '';
      const tags = video.snippet?.tags || [];
      const allText = [title, ...tags].join(' ');

      const engagement = youTubeDataService.calculateEngagementScore(
        video.statistics
      );
      const recency = youTubeDataService.calculateRecencyScore(
        video.snippet?.publishedAt
      );

      const words = allText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Allow letters, numbers, spaces, and hyphens
        .split(/\s+/)
        .filter((word) => word.length > 2 && !/^[0-9]+$/.test(word)); // Filter out short words and purely numeric strings

      words.forEach((word) => {
        const existing = keywordMap.get(word) || {
          count: 0,
          totalEngagement: 0,
          totalRecency: 0,
        };
        keywordMap.set(word, {
          count: existing.count + 1,
          totalEngagement: existing.totalEngagement + engagement,
          totalRecency: existing.totalRecency + recency,
        });
      });
    });

    const extractedKeywords: KeywordInput[] = [];
    keywordMap.forEach((value, key) => {
      extractedKeywords.push({
        keyword: key,
        source_video_count: value.count,
        engagement_score: value.totalEngagement / value.count, // Average engagement
        weighted_recency_score: value.totalRecency / value.count, // Average recency
      });
    });

    return extractedKeywords;
  }

  // 'Durable' main method to find trends
  async findYouTubeKeywordTrends(
    topic: string,
    timeframe: string,
    publishedAfter?: string,
    publishedBefore?: string
  ): Promise<YouTubeKeywordTrend[]> {
    // S.A.F.E. - Cache key generation for Redis
    const cacheKey = `youtube-trends:${topic}:${timeframe}:${publishedAfter || ''}:${publishedBefore || ''}`;
    const cachedTrends =
      await redisCacheClient.get<YouTubeKeywordTrend[]>(cacheKey);

    if (cachedTrends) {
      console.log(
        `[TrendDiscoveryService] Returning cached trends for key: ${cacheKey}`
      );
      return cachedTrends;
    }

    console.log(
      `[TrendDiscoveryService] No cache hit for key: ${cacheKey}. Fetching fresh data.`
    );
    console.info(
      `[TrendDiscoveryService] Searching YouTube for topic: "${topic}"`
    );
    const videos = await youTubeDataService.searchTrendingVideos(
      topic,
      50, // Fetch max results to get a good keyword sample
      publishedAfter,
      publishedBefore
    );

    const allExtractedKeywords: KeywordInput[] = this.extractKeywords(videos);

    if (allExtractedKeywords.length === 0) {
      console.warn(
        '[TrendDiscoveryService] No keywords extracted from YouTube videos.'
      );
      return [];
    }

    // Sort by engagement and recency first to find the most promising candidates for AI analysis
    allExtractedKeywords.sort((a, b) => {
      const scoreA = a.engagement_score * 0.6 + a.weighted_recency_score * 0.4;
      const scoreB = b.engagement_score * 0.6 + b.weighted_recency_score * 0.4;
      return scoreB - scoreA;
    });

    // Limit the number of keywords sent to the AI to stay within API rate limits
    const keywordsForAI = allExtractedKeywords.slice(0, 5);
    const otherKeywords = allExtractedKeywords.slice(5);

    console.info(
      `[TrendDiscoveryService] Getting AI relevance for top ${keywordsForAI.length} keywords.`
    );
    let aiRelevanceData: AIRelevance[] = [];
    if (keywordsForAI.length > 0) {
      // The 'getRelevanceForKeywords' service is 'Resilient' and handles its own errors,
      // returning a structured response with an error message if the API call fails.
      aiRelevanceData = await getRelevanceForKeywords(topic, keywordsForAI);
    }

    // Combine the AI-analyzed keywords with the rest
    const trendsWithAI: YouTubeKeywordTrend[] = keywordsForAI.map(
      (keyword, index) => ({
        ...keyword,
        aiRelevance: aiRelevanceData[index],
        timeframe,
      })
    );

    const trendsWithoutAI: YouTubeKeywordTrend[] = otherKeywords.map(
      (keyword) => ({
        ...keyword,
        aiRelevance: {
          score: 0,
          justification: 'Not analyzed for AI relevance to conserve quota.',
          error: undefined,
        },
        timeframe,
      })
    );

    const combinedTrends = [...trendsWithAI, ...trendsWithoutAI];

    // Final sort: prioritize keywords with an AI score, then fall back to the original sorting
    const finalTrends = combinedTrends
      .sort(
        (a, b) =>
          (b.aiRelevance.score || 0) * 0.5 +
          b.engagement_score * 0.3 +
          b.weighted_recency_score * 0.2 -
          ((a.aiRelevance.score || 0) * 0.5 +
            a.engagement_score * 0.3 +
            a.weighted_recency_score * 0.2)
      )
      .slice(0, 50);

    // S.A.F.E. - Store fresh data in Redis cache for 30 minutes
    await redisCacheClient.set(cacheKey, finalTrends, 1800);
    console.log(
      `[TrendDiscoveryService] Stored fresh trends in Redis cache for key: ${cacheKey}`
    );

    return finalTrends;
  }
}

export const trendDiscoveryService = new TrendDiscoveryService();
