import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../src/app/page';

// Mock the TrendSidebar component to isolate the Home component for testing
jest.mock('../src/components/TrendSidebar', () => {
  // The mock needs to be a function that returns a JSX element
  const MockTrendSidebar = ({ topic }: { topic: string }) => (
    <div data-testid="mock-trend-sidebar">
      <p>Mocked Trend Sidebar</p>
      <p>Topic: {topic}</p>
    </div>
  );
  MockTrendSidebar.displayName = 'MockTrendSidebar';
  return MockTrendSidebar;
});

describe('Home Page', () => {
  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders the main heading', () => {
    render(<Home />);
 
    const heading = screen.getByRole('heading', {
      name: /Trend Keyword Infuser/i,
    });
 
    expect(heading).toBeInTheDocument();
  });

  it('updates the topic in TrendSidebar when user types in the topic input', () => {
    render(<Home />);

    const topicInput = screen.getByPlaceholderText("e.g., 'Future of Artificial Intelligence'");
    fireEvent.change(topicInput, { target: { value: 'Quantum Computing' } });

    // Check if the mocked TrendSidebar receives the correct topic
    expect(screen.getByTestId('mock-trend-sidebar')).toHaveTextContent('Topic: Quantum Computing');
  });

  it('derives a topic from a pasted script and passes it to TrendSidebar', () => {
    render(<Home />);

    const scriptInput = screen.getByPlaceholderText('Paste your script here...');
    const scriptContent = 'The future of AI is fascinating. We will explore neural networks and large language models.';
    fireEvent.change(scriptInput, { target: { value: scriptContent } });

    // The component should derive the first 5 words as the topic
    const expectedTopic = 'The future of AI is';
    expect(screen.getByTestId('mock-trend-sidebar')).toHaveTextContent(`Topic: ${expectedTopic}`);
  });

  it('enables the Generate Script button only when a topic is provided', () => {
    render(<Home />);

    const generateButton = screen.getByRole('button', { name: /Generate Script/i });
    const topicInput = screen.getByPlaceholderText("e.g., 'Future of Artificial Intelligence'");

    // Button should be disabled initially
    expect(generateButton).toBeDisabled();

    // Type a topic
    fireEvent.change(topicInput, { target: { value: 'New Topic' } });

    // Button should be enabled
    expect(generateButton).toBeEnabled();

    // Clear the topic
    fireEvent.change(topicInput, { target: { value: '' } });

    // Button should be disabled again
    expect(generateButton).toBeDisabled();
  });
});
