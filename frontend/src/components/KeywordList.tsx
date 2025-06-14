import React, { useState } from 'react';
import { YouTubeKeywordItem } from './TrendSidebar'; // Assuming types are here or a shared file
import KeywordListItem from './KeywordListItem';

interface KeywordListProps {
  keywords: YouTubeKeywordItem[];
  selectedKeywords: string[];
  onKeywordClick: (keyword: string) => void;
  isLoading: boolean;
  error: string | null;
  debouncedTopic: string;
  topic: string; // For the 'Enter a topic' message
  selectedTimeframe: string;
  startDate?: string; // Optional, only relevant for custom timeframe message
  endDate?: string;   // Optional, only relevant for custom timeframe message
}

const KeywordList: React.FC<KeywordListProps> = ({
  keywords,
  selectedKeywords,
  onKeywordClick,
  isLoading,
  error,
  debouncedTopic,
  topic,
  selectedTimeframe,
  startDate,
  endDate
}) => {
  const [isMobileListVisible, setIsMobileListVisible] = useState(false);

  if (isLoading || error) {
    // Loading and error states are handled by TrendSidebar directly before this component is emphasized
    // This component focuses on displaying the list or its alternatives (no keywords, enter topic)
    return null; 
  }

  if (keywords.length === 0) {
    if (debouncedTopic.trim()) {
      return (
        <p className="text-slate-400 mt-4">
          No keywords found for "{debouncedTopic}"
          {selectedTimeframe === 'custom' && startDate && endDate 
            ? ` between ${startDate} and ${endDate}` 
            : selectedTimeframe === 'any' 
            ? ' for all time' 
            : ` within the last ${selectedTimeframe}`}
          .
        </p>
      );
    }
    if (!topic) {
      return <p className="text-slate-400 mt-4">Enter a topic to search for keywords.</p>;
    }
    return null; // Fallback, should ideally be covered by above conditions
  }

  return (
    <div>
      <button 
        onClick={() => setIsMobileListVisible(!isMobileListVisible)}
        className="w-full md:hidden bg-slate-700 p-3 rounded-lg text-left flex justify-between items-center hover:bg-slate-600 transition-colors mt-4"
        aria-expanded={isMobileListVisible}
        aria-controls="keyword-list-mobile"
      >
        <span className="font-semibold">{isMobileListVisible ? 'Hide' : 'Show'} Top 10 Keywords</span>
        <svg className={`w-5 h-5 transition-transform ${isMobileListVisible ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <ul id="keyword-list-mobile" className={`space-y-3 mt-2 md:mt-0 ${isMobileListVisible ? 'block' : 'hidden'} md:block`}>
        {keywords.map((kw, index) => (
          <KeywordListItem
            key={`${kw.keyword}-${index}`}
            keywordItem={kw}
            isSelected={selectedKeywords.includes(kw.keyword)}
            onKeywordClick={onKeywordClick}
          />
        ))}
      </ul>
    </div>
  );
};

export default KeywordList;
