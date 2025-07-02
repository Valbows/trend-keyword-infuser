import '@testing-library/jest-dom';
import React, { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor, RenderOptions } from '@testing-library/react';
import TrendSidebar from '../src/components/TrendSidebar';
import { YouTubeKeywordItem } from '../src/types/trends';
import { SelectedKeywordsProvider } from '../src/contexts/SelectedKeywordsContext';

// G.O.A.T. C.O.D.E.X. B.O.T. Note: A custom render function is 'Elegant' and 'Durable'.
// It wraps the component in necessary providers, ensuring a 'Truth-Seeking' test environment.
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SelectedKeywordsProvider>{children}</SelectedKeywordsProvider>;
};

const renderWithProvider = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });


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
  beforeEach(() => {
    // Clear mock history before each test
    (fetch as jest.Mock).mockClear();
  });

  it('renders the title and timeframe selector on initial load', () => {
    renderWithProvider(<TrendSidebar topic='' />);

    // Check for the main title
    expect(
      screen.getByRole('heading', { name: /Trending YouTube Keywords/i })
    ).toBeInTheDocument();

    // Check for the timeframe selector label
    expect(screen.getByLabelText(/Select Timeframe:/i)).toBeInTheDocument();
  });

  it('fetches and displays keywords when a topic is provided', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ keywords: mockKeywords }),
    });

    renderWithProvider(<TrendSidebar topic='AI' />);

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
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Failure'));

    renderWithProvider(<TrendSidebar topic='ErrorCase' />);

    await waitFor(() => {
      expect(screen.getByText(/API Failure/i)).toBeInTheDocument();
    });

    // Restore the original console.error function
    consoleErrorSpy.mockRestore();
  });

  it('toggles keyword selection state on click', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ keywords: mockKeywords }),
    });

    renderWithProvider(<TrendSidebar topic='AI' />);

    // Wait for the keyword to appear
    const keywordButton = await screen.findByRole('button', {
      name: /AI in 2025/i,
    });

    // G.O.A.T. C.O.D.E.X. B.O.T. Note: The 'aria-pressed' attribute is a 'Durable' and 'Xtensible'
    // way to verify selection state, reflecting true user-facing behavior.
    // Initially, it should not be selected.
    expect(keywordButton).toHaveAttribute('aria-pressed', 'false');

    // Click the keyword to select it
    fireEvent.click(keywordButton);

    // Check if it's now selected
    await waitFor(() => {
      expect(keywordButton).toHaveAttribute('aria-pressed', 'true');
    });

    // Click again to deselect
    fireEvent.click(keywordButton);

    // Check if it's deselected
    await waitFor(() => {
      expect(keywordButton).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
