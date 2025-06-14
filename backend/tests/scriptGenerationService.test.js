const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateScript } = require('../src/services/scriptGenerationService');

// Mock the @google/generative-ai module
jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent,
  }));
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel, // mockGetGenerativeModel IS defined in the factory scope
    })),
    // Expose mocks for easy access in tests
    __mockGenerateContent: mockGenerateContent, // mockGenerateContent IS defined in the factory scope
    __mockGetGenerativeModel: mockGetGenerativeModel, // mockGetGenerativeModel IS defined in the factory scope
  };
});

let originalGeminiApiKey;

describe('Script Generation Service', () => {
  const mockTrends = [
    {
      source: 'Google Trends',
      keyword: 'AI in education',
      link: 'http://example.com/ai-edu',
      pubDate: '2024-05-01',
      snippet: 'AI is transforming education.',
    },
    {
      source: 'YouTube',
      keyword: 'Top 5 AI tools',
      link: 'http://youtube.com/top-ai',
      pubDate: '2024-05-02',
      snippet: 'Discover the best AI tools.',
    },
  ];
  const topic = 'Future of AI';

  beforeAll(() => {
    originalGeminiApiKey = process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env.GEMINI_API_KEY = originalGeminiApiKey;
  });

  beforeEach(() => {
    const mocks = require('@google/generative-ai');
    // Reset __mockGenerateContent fully as its behavior (resolve/reject) is set per test.
    mocks.__mockGenerateContent.mockReset();
    // Clear only call history for __mockGetGenerativeModel, preserving its default implementation
    // to return { generateContent: __mockGenerateContent }.
    mocks.__mockGetGenerativeModel.mockClear();
    // Clear call history for the constructor mock (GoogleGenerativeAI itself).
    // The constructor is mocked as: jest.fn(() => ({ getGenerativeModel: __mockGetGenerativeModel }))
    // So, we need to clear the main constructor mock if it was called.
    if (mocks.GoogleGenerativeAI.mockClear) {
      // Check if it's a jest mock function
      mocks.GoogleGenerativeAI.mockClear();
    }

    process.env.GEMINI_API_KEY = 'test_gemini_api_key'; // Set a dummy key for most tests
  });

  it('should generate a script successfully when API key is provided', async () => {
    const mockScript = 'This is a generated script about the Future of AI.';
    require('@google/generative-ai').__mockGenerateContent.mockResolvedValue({
      response: { text: () => mockScript },
    });

    const script = await generateScript(topic, mockTrends);

    expect(script).toBe(mockScript);
    expect(
      require('@google/generative-ai').__mockGetGenerativeModel
    ).toHaveBeenCalledWith({ model: 'gemini-1.5-flash' });
    expect(
      require('@google/generative-ai').__mockGenerateContent
    ).toHaveBeenCalledTimes(1);
    // Optionally, add more specific prompt checking here if needed
  });

  it('should throw an error if GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY; // Ensure API key is not set for this test
    await expect(generateScript(topic, mockTrends)).rejects.toThrow(
      'GEMINI_API_KEY is not set.'
    );
  });

  it('should throw an error if Gemini API call fails', async () => {
    require('@google/generative-ai').__mockGenerateContent.mockRejectedValue(
      new Error('Gemini API error')
    );
    await expect(generateScript(topic, mockTrends)).rejects.toThrow(
      'Failed to generate script from Gemini API: Gemini API error'
    );
  });

  it('should throw an error if Gemini API response is not as expected', async () => {
    require('@google/generative-ai').__mockGenerateContent.mockResolvedValue({
      response: { text: () => undefined },
    }); // Simulate unexpected response
    await expect(generateScript(topic, mockTrends)).rejects.toThrow(
      'Failed to get valid script content from Gemini API response.'
    );
  });

  it('should construct a comprehensive prompt for the Gemini API', async () => {
    const mockScript = 'Generated script.';
    require('@google/generative-ai').__mockGenerateContent.mockResolvedValue({
      response: { text: () => mockScript },
    });

    await generateScript(topic, mockTrends);

    const expectedPromptStart = `Generate a concise and engaging video script (approx. 1-2 minutes, suitable for a platform like Synthesia) about "Future of AI".`;
    const expectedTrendIncorporation = `Incorporate the following current trends and keywords seamlessly into the script:`;
    const trend1Text = `- "${mockTrends[0].keyword}": ${mockTrends[0].snippet} (Source: ${mockTrends[0].source}, Published: 2024-04-30)`;
    const trend2Text = `- "${mockTrends[1].keyword}": ${mockTrends[1].snippet} (Source: ${mockTrends[1].source}, Published: 2024-05-01)`;
    const expectedEnding = `The script should be informative, engaging, and suitable for a general audience. Focus on clarity and a positive or insightful tone.
Provide only the script content itself, without any surrounding text, titles, or introductions like "Here's the script:".
Do not use markdown formatting in the script output (e.g., no ### or **).
Ensure the script flows naturally and is ready for text-to-speech conversion.`;

    const actualPrompt = require('@google/generative-ai').__mockGenerateContent
      .mock.calls[0][0];
    expect(actualPrompt).toContain(expectedPromptStart);
    expect(actualPrompt).toContain(expectedTrendIncorporation);
    expect(actualPrompt).toContain(trend1Text);
    expect(actualPrompt).toContain(trend2Text);
    expect(actualPrompt).toContain(expectedEnding);
  });
});
