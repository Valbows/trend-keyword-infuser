import { useState, useEffect } from 'react';
import type { YouTubeKeywordItem } from '@/types/trends'; // G.O.A.T. C.O.D.E.X. B.O.T. - Updated import from centralized types

interface UseYouTubeKeywordsParams {
  debouncedTopic: string;
  selectedTimeframe: string;
  startDate?: string;
  endDate?: string;
}

interface UseYouTubeKeywordsState {
  keywords: YouTubeKeywordItem[];
  isLoading: boolean;
  error: string | null;
}

/**
 * G.O.A.T. C.O.D.E.X. B.O.T. presents: useYouTubeKeywords
 * A hook for fetching YouTube keyword trends. 'Optimizes' data fetching logic,
 * provides 'Durable' state management, and offers an 'Elegant' interface for components.
 *
 * @param params - Parameters for fetching keywords including topic, timeframe, and optional custom dates.
 * @returns An object containing keywords, isLoading state, and error state.
 */
function useYouTubeKeywords({
  debouncedTopic,
  selectedTimeframe,
  startDate,
  endDate,
}: UseYouTubeKeywordsParams): UseYouTubeKeywordsState {
  const [keywords, setKeywords] = useState<YouTubeKeywordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeywords = async () => {
      if (!debouncedTopic.trim()) {
        setKeywords([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      if (selectedTimeframe === 'custom' && (!startDate || !endDate)) {
        setKeywords([]);
        // setError('For custom range, please select both a start and an end date.'); // Optional: specific error
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
            throw new Error(
              'Invalid date(s) provided. Please use the date pickers.'
            );
          }
          if (sDate > eDate) {
            throw new Error('Start date cannot be after end date.');
          }

          const publishedAfterISO = new Date(
            startDate + 'T00:00:00.000Z'
          ).toISOString();
          const publishedBeforeISO = new Date(
            endDate + 'T23:59:59.999Z'
          ).toISOString();
          queryParams += `&publishedAfterISO=${publishedAfterISO}&publishedBeforeISO=${publishedBeforeISO}`;
          queryParams += `&timeframe=custom`;
        } catch (e: unknown) {
          let errorMessage = 'Error processing custom date range.';
          if (e instanceof Error) errorMessage = e.message;
          else if (typeof e === 'string') errorMessage = e;
          console.error('Error processing custom date range:', errorMessage);
          setError(`Date Error: ${errorMessage}`);
          setIsLoading(false);
          setKeywords([]);
          return;
        }
      } else {
        queryParams += `&timeframe=${selectedTimeframe}`;
      }

      try {
        const response = await fetch(
          `/api/trends/youtube-keywords?${queryParams}`
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP error! status: ${response.status}`,
          }));
          throw new Error(
            errorData.error ||
              errorData.message ||
              `HTTP error! status: ${response.status}`
          );
        }
        const data = await response.json();
        setKeywords((data.keywords || []).slice(0, 10)); // Keep the top 10 logic
      } catch (err: unknown) {
        console.error('Failed to fetch YouTube Keywords:', err);
        let errorMessage = 'Failed to load keywords.';
        if (err instanceof Error) errorMessage = err.message;
        else if (typeof err === 'string') errorMessage = err;
        setError(errorMessage);
        setKeywords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKeywords();
  }, [debouncedTopic, selectedTimeframe, startDate, endDate]);

  return { keywords, isLoading, error };
}

export default useYouTubeKeywords;
