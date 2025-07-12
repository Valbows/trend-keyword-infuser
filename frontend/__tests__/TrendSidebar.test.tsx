import '@testing-library/jest-dom';
import React, { ReactElement } from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  RenderOptions,
} from '@testing-library/react';
import TrendSidebar from '../src/components/TrendSidebar';
import { YouTubeKeywordItem } from '../src/types/trends';
import { SelectedKeywordsProvider } from '../src/contexts/SelectedKeywordsContext';
import useYouTubeKeywords from '../src/hooks/useYouTubeKeywords';

// Mock the useYouTubeKeywords hook
jest.mock('../src/hooks/useYouTubeKeywords');

const mockUseYouTubeKeywords = useYouTubeKeywords as jest.Mock;

// G.O.A.T. C.O.D.E.X. B.O.T. Note: A custom render function is 'Elegant' and 'Durable'.
// It wraps the component in necessary providers, ensuring a 'Truth-Seeking' test environment.
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <SelectedKeywordsProvider>{children}</SelectedKeywordsProvider>;
};

const renderWithProvider = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

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
    // Reset the mock before each test and provide a default implementation
    mockUseYouTubeKeywords.mockReturnValue({
      keywords: [],
      isLoading: false,
      error: null,
    });
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
    mockUseYouTubeKeywords.mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
      error: null,
    });

    renderWithProvider(<TrendSidebar topic='AI' />);

    // Wait for keywords to be displayed
    await waitFor(() => {
      expect(screen.getByText('AI in 2025')).toBeInTheDocument();
    });

    expect(screen.getByText('Future of Machine Learning')).toBeInTheDocument();
  });

  it('shows an error message if the keyword fetch fails', async () => {
    mockUseYouTubeKeywords.mockReturnValue({
      keywords: [],
      isLoading: false,
      error: 'API Failure',
    });

    renderWithProvider(<TrendSidebar topic='ErrorCase' />);

    await waitFor(() => {
      expect(screen.getByText(/API Failure/i)).toBeInTheDocument();
    });
  });

  it('toggles keyword selection state on click', async () => {
    mockUseYouTubeKeywords.mockReturnValue({
      keywords: mockKeywords,
      isLoading: false,
      error: null,
    });

    renderWithProvider(<TrendSidebar topic='AI' />);

    // Wait for the keyword to appear
    const keywordText = await screen.findByText('AI in 2025');
    const keywordListItem = keywordText.closest('li');
    expect(keywordListItem).toBeInTheDocument();

    // G.O.A.T. C.O.D.E.X. B.O.T. Note: The 'aria-pressed' attribute is a 'Durable' and 'Xtensible'
    // way to verify selection state, reflecting true user-facing behavior.
    // Initially, it should not be selected.
    expect(keywordListItem).toHaveAttribute('aria-pressed', 'false');

    // Click the keyword to select it
    fireEvent.click(keywordListItem!);

    // Check if it's now selected
    await waitFor(() => {
      expect(keywordListItem).toHaveAttribute('aria-pressed', 'true');
    });

    // Click again to deselect
    fireEvent.click(keywordListItem!);

    // Check if it's deselected
    await waitFor(() => {
      expect(keywordListItem).toHaveAttribute('aria-pressed', 'false');
    });
  });
});
