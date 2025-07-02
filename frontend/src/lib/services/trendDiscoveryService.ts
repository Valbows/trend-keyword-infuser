// G.O.A.T. C.O.D.E.X. B.O.T. - Migrated and Enhanced TrendDiscoveryService
// 'Durable', 'Optimized', and 'Xtensible' TypeScript implementation.

import { youtube_v3 } from 'googleapis';
import { youTubeDataService } from './youTubeDataService';
import {
  getRelevanceForKeywords,
  KeywordInput,
  AIRelevance,
} from './keywordAnalysisService';

// 'Optimized' list of stop words to filter out common noise from video titles and descriptions.
const STOP_WORDS = new Set([
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
  'like',
  'subscribe',
  'comment',
  'share',
  'follow',
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
]);

// 'Elegant' and 'Xtensible' type definitions
interface ExtractedKeyword extends KeywordInput {
  engagement_score: number;
  weighted_recency_score: number;
  source_video_count: number;
}

export interface YouTubeKeywordItem extends ExtractedKeyword {
  timeframe: string;
  aiRelevance: AIRelevance | null;
}

class TrendDiscoveryService {
  private async _extractKeywordsFromVideos(
    videos: youtube_v3.Schema$SearchResult[]
  ): Promise<ExtractedKeyword[]> {
    const keywordMap = new Map<
      string,
      {
        count: number;
        weighted_recency_score_sum: number;
        source_videos: Set<string>;
      }
    >();
    const MIN_KEYWORD_LENGTH = 3;

    if (videos.length === 0) return [];

    const videoDates = videos
      .map((v) => new Date(v.snippet?.publishedAt || 0))
      .filter((d) => !isNaN(d.getTime()));
    const minDate =
      videoDates.length > 0
        ? Math.min(...videoDates.map((d) => d.getTime()))
        : Date.now();
    const maxDate =
      videoDates.length > 0
        ? Math.max(...videoDates.map((d) => d.getTime()))
        : Date.now();
    const dateRange = maxDate - minDate > 0 ? maxDate - minDate : 1;

    for (const video of videos) {
      if (!video.snippet || !video.id?.videoId) continue;

      const title = video.snippet.title || '';
      const description = video.snippet.description || '';
      const combinedText = `${title} ${description}`.toLowerCase();
      const tokens = combinedText
        .split(/[^a-z0-9'-]+/)
        .filter((t) => t && t.length > 0 && t !== "'" && t !== '-');

      for (const token of tokens) {
        if (token.length >= MIN_KEYWORD_LENGTH && !STOP_WORDS.has(token)) {
          if (!keywordMap.has(token)) {
            keywordMap.set(token, {
              count: 0,
              weighted_recency_score_sum: 0,
              source_videos: new Set(),
            });
          }
          const keywordData = keywordMap.get(token)!;
          const currentVideoDate = new Date(video.snippet.publishedAt!);
          const recencyScore = !isNaN(currentVideoDate.getTime())
            ? (currentVideoDate.getTime() - minDate) / dateRange
            : 0.5;

          keywordData.count++;
          keywordData.weighted_recency_score_sum += recencyScore;
          if (!keywordData.source_videos.has(video.id.videoId)) {
            keywordData.source_videos.add(video.id.videoId);
          }
        }
      }
    }

    const extractedKeywords: ExtractedKeyword[] = [];
    for (const [keyword, data] of keywordMap.entries()) {
      extractedKeywords.push({
        keyword,
        engagement_score: data.count, // Simple count-based engagement for now
        weighted_recency_score: data.weighted_recency_score_sum / data.count, // Average recency
        source_video_count: data.source_videos.size,
      });
    }

    return extractedKeywords
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 50); // Return top 50 keywords
  }

  public async findYouTubeKeywordTrends(
    topic: string,
    timeframe: string,
    publishedAfter?: string,
    publishedBefore?: string
  ): Promise<YouTubeKeywordItem[]> {
    if (!youTubeDataService) {
      throw new Error(
        'YouTubeDataService is not initialized. Check YOUTUBE_API_KEY.'
      );
    }

    const query = `${topic} tutorial "how to" update news`;
    const videos = await youTubeDataService.searchVideos(
      query,
      50,
      publishedAfter,
      publishedBefore
    );

    if (videos.length === 0) {
      return [];
    }

    const extractedKeywords = await this._extractKeywordsFromVideos(videos);
    const keywordsWithRelevance = await getRelevanceForKeywords(
      extractedKeywords,
      topic
    );

    const finalResult: YouTubeKeywordItem[] = keywordsWithRelevance.map(
      (kw) => ({
        ...kw,
        timeframe,
      })
    );

    return finalResult;
  }
}

export const trendDiscoveryService = new TrendDiscoveryService();
