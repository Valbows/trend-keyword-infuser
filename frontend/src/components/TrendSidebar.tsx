// frontend/src/components/TrendSidebar.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';

// Define the structure for YouTube Keyword items
interface AIRelevance {
  score?: number;
  justification?: string;
  error?: string;
}

export interface YouTubeKeywordItem {
  keyword: string;
  engagement_score: number;
  source_video_count: number;
  timeframe: string;
  aiRelevance?: AIRelevance | null; // Updated to include AI relevance data
  // Optionally, if we decide to pass source_videos from backend later
  // source_videos?: Array<{ videoId: string; videoTitle: string; }>; 
}

// The NewsItem and GoogleTrendItem interfaces are no longer needed for this component's primary function.

interface TrendSidebarProps {
  selectedKeywords: string[];
  onSelectedKeywordsChange: (keywords: string[]) => void;
  topic: string;
}

const timeframes = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '48h', label: 'Last 48 Hours' },
  { value: '72h', label: 'Last 72 Hours' },
  { value: 'any', label: 'All Time' },
  { value: 'custom', label: 'Custom Range…' },
];

const TrendSidebar: React.FC<TrendSidebarProps> = ({ selectedKeywords, onSelectedKeywordsChange, topic }) => {
  const [keywords, setKeywords] = useState<YouTubeKeywordItem[]>([]);
  const [debouncedTopic, setDebouncedTopic] = useState<string>(topic); // Debounced topic for API calls
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h'); // Default timeframe
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(false);

  // Effect for debouncing the topic input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTopic(topic);
    }, 750); // 750ms delay

    // Cleanup function to clear the timeout if topic changes before delay is over
    return () => {
      clearTimeout(handler);
    };
  }, [topic]); // This effect runs when 'topic' changes

  // Effect for fetching keywords when debouncedTopic or selectedTimeframe changes
  useEffect(() => {
    const fetchYouTubeKeywords = async () => {
      // Guard clause: if debouncedTopic is empty, clear keywords and don't fetch.
      if (!debouncedTopic.trim()) {
        setKeywords([]);
        setError(null); // Clear previous errors if any
        setIsLoading(false); // Ensure loading is false
        return;
      }

      // For custom range, ensure both dates are set before attempting to fetch
      if (selectedTimeframe === 'custom' && (!startDate || !endDate)) {
        setKeywords([]); // Clear keywords if dates are incomplete for custom range
        // Optionally set a specific error or info message for incomplete custom dates
        // setError("For custom range, please select both a start and an end date."); 
        // For now, just clear and don't show loading, useEffect will re-trigger if dates are set.
        setIsLoading(false); 
        return;
      }

      setIsLoading(true);
      setError(null);

      let queryParams = `topic=${encodeURIComponent(debouncedTopic)}`;
      
      if (selectedTimeframe === 'custom' && startDate && endDate) {
        try {
          const sDate = new Date(startDate);
          const eDate = new Date(endDate);

          if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
            throw new Error("Invalid date(s) provided. Please use the date pickers.");
          }
          if (sDate > eDate) {
            throw new Error("Start date cannot be after end date.");
          }

          const publishedAfterISO = new Date(startDate + 'T00:00:00.000Z').toISOString();
          const publishedBeforeISO = new Date(endDate + 'T23:59:59.999Z').toISOString();
          queryParams += `&publishedAfterISO=${publishedAfterISO}&publishedBeforeISO=${publishedBeforeISO}`;
          queryParams += `&timeframe=custom`; // Explicitly tell backend custom dates are used
        } catch (e: any) {
          console.error("Error processing custom date range:", e.message);
          setError(`Date Error: ${e.message}`);
          setIsLoading(false);
          setKeywords([]);
          return; 
        }
      } else {
        queryParams += `&timeframe=${selectedTimeframe}`;
      }
      
      try {
        const response = await fetch(`/api/v1/trends/youtube-keywords?${queryParams}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setKeywords((data.keywords || []).slice(0, 10));
      } catch (err: any) {
        console.error('Failed to fetch YouTube Keywords:', err);
        setError(err.message || 'Failed to load keywords.');
        setKeywords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYouTubeKeywords(); // Call fetchYouTubeKeywords directly, the guard clause inside handles empty debouncedTopic.

  }, [debouncedTopic, selectedTimeframe, startDate, endDate]); // Re-fetch on these changes

  const handleKeywordClick = useCallback((keywordClicked: string) => {
    const newSelectedKeywords = selectedKeywords.includes(keywordClicked)
      ? selectedKeywords.filter(k => k !== keywordClicked)
      : [...selectedKeywords, keywordClicked];
    onSelectedKeywordsChange(newSelectedKeywords);
  }, [selectedKeywords, onSelectedKeywordsChange]);

  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 bg-slate-800 p-6 space-y-4 h-screen overflow-y-auto text-slate-100 shadow-lg">
      <h2 className="text-2xl font-bold text-sky-400 mb-6 border-b border-slate-700 pb-3">Trending YouTube Keywords</h2>


      <div className="mb-4">
        <label htmlFor="timeframeSelect" className="block text-sm font-medium text-slate-300 mb-1">Select Timeframe:</label>
        <select 
          id="timeframeSelect"
          value={selectedTimeframe}
          onChange={(e) => {
            const newTimeframe = e.target.value;
            setSelectedTimeframe(newTimeframe);
            // If switching away from custom, clear dates to prevent confusion
            if (newTimeframe !== 'custom') {
              setStartDate('');
              setEndDate('');
            }
          }}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100"
        >
          {timeframes.map(tf => (
            <option key={tf.value} value={tf.value}>{tf.label}</option>
          ))}
        </select>
      </div>

      {/* Custom Date Range Inputs - Conditionally Rendered */}
      {selectedTimeframe === 'custom' && (
        <div className="my-4 p-3 bg-slate-700/50 rounded-md border border-slate-600 space-y-3">
          <p className="text-sm text-slate-300 font-medium">Custom Date Range:</p>
          <div>
            <label htmlFor="startDate" className="block text-xs font-medium text-slate-400 mb-1">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-xs font-medium text-slate-400 mb-1">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 text-sm"
            />
          </div>
          {(!startDate || !endDate) && <p className="text-xs text-amber-400 mt-1">Both start and end dates are required for a custom range search.</p>}
        </div>
      )}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          {/* Basic Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      )}
      {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md">Error: {error}</p>}
      {!isLoading && !error && keywords.length === 0 && debouncedTopic.trim() && (
        <p className="text-slate-400">
          No keywords found for "{debouncedTopic}"
          {selectedTimeframe === 'custom' && startDate && endDate ? ` between ${startDate} and ${endDate}` : 
           selectedTimeframe === 'any' ? ' for all time' : ` within the last ${selectedTimeframe}`}
          .
        </p>
      )}
      {!isLoading && !error && keywords.length === 0 && !topic && <p className="text-slate-400">Enter a topic to search for keywords.</p>}
      {keywords.length > 0 && (
        <div>
          <button 
            onClick={() => setIsMobileListVisible(!isMobileListVisible)}
            className="w-full md:hidden bg-slate-700 p-3 rounded-lg text-left flex justify-between items-center hover:bg-slate-600 transition-colors"
          >
            <span className="font-semibold">Show/Hide Top 10 Keywords</span>
            <svg className={`w-5 h-5 transition-transform ${isMobileListVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
                    <ul className={`space-y-3 mt-2 md:mt-0 ${isMobileListVisible ? 'block' : 'hidden'} md:block`}>
            {keywords.map((kw, index) => {
              const isSelected = selectedKeywords.includes(kw.keyword);
              return (
                <li
                  key={`${kw.keyword}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleKeywordClick(kw.keyword)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault(); // Prevent scrolling on spacebar
                      handleKeywordClick(kw.keyword);
                    }
                  }}
                  className={`p-3 rounded-lg shadow-md transition-all duration-200 cursor-pointer 
                    ${isSelected 
                      ? 'bg-sky-600 ring-2 ring-sky-400 scale-105' 
                      : 'bg-slate-700/50 hover:bg-slate-700'}`}
                >
                  <h3 className="text-md text-sky-300 font-semibold">{kw.keyword}</h3>
                  <p className="text-xs text-slate-400">
                    Engagement Score: <span className="font-medium text-sky-400">{kw.engagement_score}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Source Videos: <span className="font-medium text-slate-300">{kw.source_video_count}</span> | Timeframe: <span className="font-medium text-slate-300">{kw.timeframe}</span>
                  </p>
                  {kw.aiRelevance && (
                    <div className="mt-1 pt-1 border-t border-slate-600/50">
                      {typeof kw.aiRelevance.score === 'number' && (
                        <p className="text-xs text-slate-400">
                          AI Relevance: <span className="font-semibold text-teal-400">{kw.aiRelevance.score}/5</span>
                        </p>
                      )}
                      {kw.aiRelevance.justification && (
                        <p className="text-xs text-slate-500 italic">
                          &ldquo;{kw.aiRelevance.justification}&rdquo;
                        </p>
                      )}
                      {kw.aiRelevance.error && (
                        <p className="text-xs text-amber-400">
                          AI Note: <span className="italic">{kw.aiRelevance.error}</span>
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default TrendSidebar;
