import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrendSidebar from '../src/components/TrendSidebar';
import { YouTubeKeywordItem } from '../src/components/TrendSidebar';

// Mock the global fetch function
global.fetch = jest.fn();

const mockKeywords: YouTubeKeywordItem[] = [
  {
    keyword: 'AI in 2025',
    engagement_score: 95,
    source_video_count: 120,
    timeframe: '24h',
  },
  {
    keyword: 'Future of Machine Learning',
    engagement_score: 92,
    source_video_count: 95,
    timeframe: '24h',
  },
];

describe('TrendSidebar Component', () => {
  const mockOnSelectedKeywordsChange = jest.fn();

  beforeEach(() => {
    // Clear mock history before each test
    (fetch as jest.Mock).mockClear();
    mockOnSelectedKeywordsChange.mockClear();
  });

  it('renders the title and timeframe selector on initial load', () => {
    render(
      <TrendSidebar
        selectedKeywords={[]}
        onSelectedKeywordsChange={mockOnSelectedKeywordsChange}
        topic=""
      />
    );

    // Check for the main title
    expect(screen.getByRole('heading', { name: /Trending YouTube Keywords/i })).toBeInTheDocument();

    // Check for the timeframe selector label
    expect(screen.getByLabelText(/Select Timeframe:/i)).toBeInTheDocument();
  });

  it('fetches and displays keywords when a topic is provided', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ keywords: mockKeywords }),
    });

    render(
      <TrendSidebar
        selectedKeywords={[]}
        onSelectedKeywordsChange={mockOnSelectedKeywordsChange}
        topic="AI"
      />
    );



    // Wait for keywords to be displayed
    await waitFor(() => {
      expect(screen.getByText('AI in 2025')).toBeInTheDocument();
    });

    expect(screen.getByText('Future of Machine Learning')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('topic=AI'));
  });

  it('shows an error message if the keyword fetch fails', async () => {
    // Suppress console.error for this specific test, as it's an expected part of the behavior.
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Failure'));

    render(
      <TrendSidebar
        selectedKeywords={[]}
        onSelectedKeywordsChange={mockOnSelectedKeywordsChange}
        topic="ErrorCase"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/API Failure/i)).toBeInTheDocument();
    });

    // Restore the original console.error function
    consoleErrorSpy.mockRestore();
  });

  it('calls onSelectedKeywordsChange when a keyword is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ keywords: mockKeywords }),
    });

    render(
      <TrendSidebar
        selectedKeywords={[]}
        onSelectedKeywordsChange={mockOnSelectedKeywordsChange}
        topic="AI"
      />
    );

    // Wait for the keyword to appear
    const keywordButton = await screen.findByRole('button', { name: /AI in 2025/i });

    // Click the keyword
    fireEvent.click(keywordButton);

    // Check if the callback was called correctly
    expect(mockOnSelectedKeywordsChange).toHaveBeenCalledTimes(1);
    expect(mockOnSelectedKeywordsChange).toHaveBeenCalledWith(['AI in 2025']);
  });
});
