// frontend/src/components/TrendSidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';

// Define the structure for YouTube Keyword items
interface YouTubeKeywordItem {
  keyword: string;
  engagement_score: number;
  source_video_count: number;
  timeframe: string;
  // Optionally, if we decide to pass source_videos from backend later
  // source_videos?: Array<{ videoId: string; videoTitle: string; }>; 
}

// The NewsItem and GoogleTrendItem interfaces are no longer needed for this component's primary function.

const TrendSidebar: React.FC = () => {
  const [keywords, setKeywords] = useState<YouTubeKeywordItem[]>([]);
  const [topic, setTopic] = useState<string>('artificial intelligence'); // Default topic for initial testing
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h'); // Default timeframe
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const timeframes = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '48h', label: 'Last 48 Hours' },
    { value: '72h', label: 'Last 72 Hours' },
    { value: 'any', label: 'All Time' },
  ];

  useEffect(() => {
    const fetchYouTubeKeywords = async () => {
      if (!topic) {
        setKeywords([]); // Clear keywords if topic is empty
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/v1/trends/youtube-keywords?topic=${encodeURIComponent(topic)}&timeframe=${selectedTimeframe}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Expects { topic, timeframe, keywords: YouTubeKeywordItem[] }
        setKeywords(data.keywords || []);
      } catch (err: any) {
        console.error('Failed to fetch YouTube Keywords:', err);
        setError(err.message || 'Failed to load keywords.');
        setKeywords([]); // Clear keywords on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchYouTubeKeywords();
  }, [topic, selectedTimeframe]); // Re-fetch when topic or timeframe changes

  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 bg-slate-800 p-6 space-y-4 h-screen overflow-y-auto text-slate-100 shadow-lg">
      <h2 className="text-2xl font-bold text-sky-400 mb-6 border-b border-slate-700 pb-3">YouTube Keyword Trends</h2>
      {/* Temporary Topic Input - REMOVE/REFACTOR for integration with main page topic input */}
      <div className="mb-4">
        <label htmlFor="topicInput" className="block text-sm font-medium text-slate-300 mb-1">Enter Topic (Temporary):</label>
        <input 
          type="text" 
          id="topicInput"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., AI, React, Gaming"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="timeframeSelect" className="block text-sm font-medium text-slate-300 mb-1">Select Timeframe:</label>
        <select 
          id="timeframeSelect"
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
        >
          {timeframes.map(tf => (
            <option key={tf.value} value={tf.value}>{tf.label}</option>
          ))}
        </select>
      </div>
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          {/* Basic Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      )}
      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md">Error: {error}</p>}
      {!isLoading && !error && keywords.length === 0 && topic && <p className="text-slate-400">No keywords found for "{topic}" within {selectedTimeframe === 'any' ? 'all time' : selectedTimeframe}.</p>}
      {!isLoading && !error && keywords.length === 0 && !topic && <p className="text-slate-400">Enter a topic to search for keywords.</p>}
      {keywords.length > 0 && (
        <ul className="space-y-3">
          {keywords.map((kw, index) => (
            <li key={`${kw.keyword}-${index}`} className="p-3 bg-slate-700/50 rounded-lg shadow-md hover:bg-slate-700 transition-colors duration-150">
              <h3 className="text-md text-sky-300 font-semibold">{kw.keyword}</h3>
              <p className="text-xs text-slate-400">
                Engagement Score: <span className="font-medium text-sky-400">{kw.engagement_score}</span>
              </p>
              <p className="text-xs text-slate-400">
                Source Videos: <span className="font-medium text-slate-300">{kw.source_video_count}</span> | Timeframe: <span className="font-medium text-slate-300">{kw.timeframe}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default TrendSidebar;
