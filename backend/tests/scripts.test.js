const request = require('supertest');
const app = require('../src/app'); // Adjust path as necessary
const scriptGenerationService = require('../src/services/scriptGenerationService');

// Mock the scriptGenerationService
jest.mock('../src/services/scriptGenerationService');

describe('POST /api/v1/scripts/generate', () => {
  const mockTopic = 'Future of AI';
  const mockTrends = [
    { keyword: 'AI in healthcare', snippet: 'AI revolutionizing diagnostics.', source: 'Tech Journal', pubDate: '2024-05-01T00:00:00Z' },
    { keyword: 'Ethical AI', snippet: 'Debates on AI ethics continue.', source: 'Philosophy Today', pubDate: '2024-05-02T00:00:00Z' },
  ];
  const mockGeneratedScript = 'This is a mock AI generated script about the Future of AI.';

  beforeEach(() => {
    // Reset all mocks before each test
    scriptGenerationService.generateScript.mockReset();
  });

  it('should generate a script successfully with topic and trends', async () => {
    scriptGenerationService.generateScript.mockResolvedValue(mockGeneratedScript);

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ script: mockGeneratedScript });
    expect(scriptGenerationService.generateScript).toHaveBeenCalledWith(mockTopic, mockTrends);
  });

  it('should generate a script successfully with only a topic (empty trends)', async () => {
    scriptGenerationService.generateScript.mockResolvedValue(mockGeneratedScript);

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic }); // No trends array sent

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ script: mockGeneratedScript });
    // The controller defaults trends to [] if not provided or not an array
    expect(scriptGenerationService.generateScript).toHaveBeenCalledWith(mockTopic, []); 
  });

  it('should return 400 if topic is missing', async () => {
    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ trends: mockTrends }); // Missing topic

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing required field: topic' });
    expect(scriptGenerationService.generateScript).not.toHaveBeenCalled();
  });

  it('should return 500 if GEMINI_API_KEY is not set in service', async () => {
    scriptGenerationService.generateScript.mockRejectedValue(new Error('GEMINI_API_KEY is not set.'));

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Script generation service is not configured.' });
  });

  it('should return 502 if Gemini API returns an invalid response', async () => {
    scriptGenerationService.generateScript.mockRejectedValue(new Error('Failed to get valid script content from Gemini API response.'));

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ error: 'Failed to generate script due to an issue with the AI service response.' });
  });

  it('should return 500 for other service errors', async () => {
    scriptGenerationService.generateScript.mockRejectedValue(new Error('Some other internal service error.'));

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to generate script due to an internal server error.' });
  });
});
