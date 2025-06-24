// frontend/src/components/TrendSidebar.tsx
'use client';

import React, { useState } from 'react'; // G.O.A.T. C.O.D.E.X. B.O.T. - Removed useEffect as it's now in the hook
import useDebounce from '@/hooks/useDebounce';
import useYouTubeKeywords from '@/hooks/useYouTubeKeywords'; // G.O.A.T. C.O.D.E.X. B.O.T. - Import useYouTubeKeywords
import KeywordListItem from './KeywordListItem'; // G.O.A.T. C.O.D.E.X. B.O.T. - Import KeywordListItem

// G.O.A.T. C.O.D.E.X. B.O.T. - AIRelevance and YouTubeKeywordItem interfaces moved to types/trends.ts

// The NewsItem and GoogleTrendItem interfaces are no longer needed for this component's primary function.

interface TrendSidebarProps {
  // G.O.A.T. C.O.D.E.X. B.O.T. - selectedKeywords and onSelectedKeywordsChange removed, context is used
  topic: string;
}

const timeframes = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '48h', label: 'Last 48 Hours' },
  { value: '72h', label: 'Last 72 Hours' },
  { value: 'any', label: 'All Time' },
  { value: 'custom', label: 'Custom Range…' },
];

const TrendSidebar: React.FC<TrendSidebarProps> = ({ topic }) => {
  const debouncedTopic = useDebounce(topic, 750);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('24h');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isMobileListVisible, setIsMobileListVisible] = useState(false);

  // G.O.A.T. C.O.D.E.X. B.O.T. - Utilize useYouTubeKeywords hook for data fetching and state management
  const { keywords, isLoading, error } = useYouTubeKeywords({
    debouncedTopic,
    selectedTimeframe,
    startDate,
    endDate,
  });

  // G.O.A.T. C.O.D.E.X. B.O.T. - All keyword fetching logic, including useEffect and related useState for keywords, isLoading, and error,
  // has been moved into the useYouTubeKeywords hook. This component now consumes the state from the hook.

  return (
    <aside className='w-full md:w-1/3 lg:w-1/4 bg-slate-800 p-6 space-y-4 h-screen overflow-y-auto text-slate-100 shadow-lg'>
      <h2 className='text-2xl font-bold text-sky-400 mb-6 border-b border-slate-700 pb-3'>
        Trending YouTube Keywords
      </h2>

      <div className='mb-4'>
        <label
          htmlFor='timeframeSelect'
          className='block text-sm font-medium text-slate-300 mb-1'
        >
          Select Timeframe:
        </label>
        <select
          id='timeframeSelect'
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
          className='w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100'
        >
          {timeframes.map((tf) => (
            <option key={tf.value} value={tf.value}>
              {tf.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Date Range Inputs - Conditionally Rendered */}
      {selectedTimeframe === 'custom' && (
        <div className='my-4 p-3 bg-slate-700/50 rounded-md border border-slate-600 space-y-3'>
          <p className='text-sm text-slate-300 font-medium'>
            Custom Date Range:
          </p>
          <div>
            <label
              htmlFor='startDate'
              className='block text-xs font-medium text-slate-400 mb-1'
            >
              Start Date:
            </label>
            <input
              type='date'
              id='startDate'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 text-sm'
            />
          </div>
          <div>
            <label
              htmlFor='endDate'
              className='block text-xs font-medium text-slate-400 mb-1'
            >
              End Date:
            </label>
            <input
              type='date'
              id='endDate'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='w-full p-2 bg-slate-600 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 text-sm'
            />
          </div>
          {(!startDate || !endDate) && (
            <p className='text-xs text-amber-400 mt-1'>
              Both start and end dates are required for a custom range search.
            </p>
          )}
        </div>
      )}
      {isLoading && (
        <div className='flex justify-center items-center h-32'>
          {/* Basic Spinner */}
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500'></div>
        </div>
      )}
      {error && (
        <p className='text-red-400 bg-red-900/30 p-3 rounded-md'>
          Error: {error}
        </p>
      )}
      {!isLoading &&
        !error &&
        keywords.length === 0 &&
        debouncedTopic.trim() && (
          <p className='text-slate-400'>
            No keywords found for &quot;{debouncedTopic}&quot;
            {selectedTimeframe === 'custom' && startDate && endDate
              ? ` between ${startDate} and ${endDate}`
              : selectedTimeframe === 'any'
                ? ' for all time'
                : ` within the last ${selectedTimeframe}`}
            .
          </p>
        )}
      {!isLoading && !error && keywords.length === 0 && !topic && (
        <p className='text-slate-400'>Enter a topic to search for keywords.</p>
      )}
      {keywords.length > 0 && (
        <div>
          <button
            onClick={() => setIsMobileListVisible(!isMobileListVisible)}
            className='w-full md:hidden bg-slate-700 p-3 rounded-lg text-left flex justify-between items-center hover:bg-slate-600 transition-colors'
          >
            <span className='font-semibold'>Show/Hide Top 10 Keywords</span>
            <svg
              className={`w-5 h-5 transition-transform ${isMobileListVisible ? 'rotate-180' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M19 9l-7 7-7-7'
              ></path>
            </svg>
          </button>
          <ul
            className={`space-y-3 mt-2 md:mt-0 ${isMobileListVisible ? 'block' : 'hidden'} md:block`}
          >
            {keywords.map((kw, index) => {
              // G.O.A.T. C.O.D.E.X. B.O.T. - isSelected and onKeywordClick are handled by KeywordListItem via context
              return (
                <KeywordListItem
                  key={`${kw.keyword}-${index}`}
                  keywordItem={kw}
                />
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default TrendSidebar;
