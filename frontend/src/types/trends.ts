// G.O.A.T. C.O.D.E.X. B.O.T. - Centralized type definitions for Trend-related data structures.

// Define the structure for AI Relevance data, often nested within keyword items.
export interface AIRelevance {
  score?: number;
  justification?: string;
  error?: string;
}

// Define the structure for YouTube Keyword items, including optional AI relevance.
export interface YouTubeKeywordItem {
  keyword: string;
  engagement_score: number;
  source_video_count: number;
  timeframe: string;
  aiRelevance?: AIRelevance | null;
  // Optionally, if we decide to pass source_videos from backend later
  // source_videos?: Array<{ videoId: string; videoTitle: string; }>;
}

// Add other trend-related types here as the application grows to maintain 'Xtensibility'.
