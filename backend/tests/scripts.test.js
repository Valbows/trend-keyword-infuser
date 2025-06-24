const request = require('supertest');
const app = require('../src/app'); // Adjust path as necessary
const scriptGenerationService = require('../src/services/scriptGenerationService'); // Will be orchestrated
const scriptOrchestrationService = require('../src/services/scriptOrchestrationService');
const cacheService = require('../src/services/cacheService'); // For clearing cache

// Mock the services
jest.mock('../src/services/scriptGenerationService'); // Mocked as it's a deeper dependency
jest.mock('../src/services/scriptOrchestrationService'); // Controller's direct dependency for core logic

describe('POST /api/v1/scripts/generate', () => {
  const mockTopic = 'Future of AI';
  const mockTrends = [
    {
      keyword: 'AI in healthcare',
      snippet: 'AI revolutionizing diagnostics.',
      source: 'Tech Journal',
      pubDate: '2024-05-01T00:00:00Z',
    },
    {
      keyword: 'Ethical AI',
      snippet: 'Debates on AI ethics continue.',
      source: 'Philosophy Today',
      pubDate: '2024-05-02T00:00:00Z',
    },
  ];
  const mockGeneratedScript =
    'This is a mock AI generated script about the Future of AI.';

  beforeEach(() => {
    // Reset all mocks before each test
    scriptGenerationService.generateScript.mockReset(); // For completeness
    scriptOrchestrationService.orchestrateScriptCreation.mockReset();
    cacheService.clear(); // Clear cache before each test to prevent interference
  });

  it('should generate a script successfully with topic and trends', async () => {
    // Mock what scriptOrchestrationService returns
    const orchestratedScriptData = {
      script: mockGeneratedScript, // The actual script text
      scriptId: 'orchestration-mock-id-1', // An ID that might come from orchestration if it saved it first
      topic: mockTopic,
    };
    scriptOrchestrationService.orchestrateScriptCreation.mockResolvedValue(orchestratedScriptData);

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(200);
    // Assert the final response structure from the controller
    expect(response.body).toEqual({
      scriptId: expect.any(String), // This is the ID from the controller's Supabase save
      script: orchestratedScriptData, // The controller nests the orchestration result here
      topic: mockTopic,
    });
    expect(
      scriptOrchestrationService.orchestrateScriptCreation
    ).toHaveBeenCalledWith(mockTopic, mockTrends);
  });

  it('should generate a script successfully with only a topic (empty trends)', async () => {
    // Mock what scriptOrchestrationService returns
    const orchestratedScriptData = {
      script: mockGeneratedScript,
      scriptId: 'orchestration-mock-id-2',
      topic: mockTopic,
    };
    scriptOrchestrationService.orchestrateScriptCreation.mockResolvedValue(orchestratedScriptData);

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic }); // No trends array sent

    expect(response.status).toBe(200);
    // Assert the final response structure from the controller
    expect(response.body).toEqual({
      scriptId: expect.any(String), // This is the ID from the controller's Supabase save
      script: orchestratedScriptData, // The controller nests the orchestration result here
      topic: mockTopic,
    });
    // The controller defaults trends to [] if not provided or not an array
    // and passes this to the orchestration service
    expect(
      scriptOrchestrationService.orchestrateScriptCreation
    ).toHaveBeenCalledWith(mockTopic, []);
  });

  it('should return 400 if topic is missing', async () => {
    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ trends: mockTrends }); // Missing topic

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Missing required field: topic' });
    expect(
      scriptOrchestrationService.orchestrateScriptCreation
    ).not.toHaveBeenCalled();
  });

  it('should return 500 if GEMINI_API_KEY is not set in service', async () => {
    scriptOrchestrationService.orchestrateScriptCreation.mockRejectedValue(
      new Error('GEMINI_API_KEY is not set.') // This specific error message is checked by controller
    );

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Script generation service is not configured.',
    });
  });

  it('should return 502 if Gemini API returns an invalid response', async () => {
    scriptOrchestrationService.orchestrateScriptCreation.mockRejectedValue(
      new Error('Failed to get valid script content from Gemini API response.') // This specific error message is checked by controller
    );

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error:
        'Failed to generate script due to an issue with the AI service response.',
    });
  });

  it('should return 500 for other service errors', async () => {
    scriptOrchestrationService.orchestrateScriptCreation.mockRejectedValue(
      new Error('Some other internal service error.') // Generic error
    );

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Failed to generate script due to an internal server error.',
    });
  });
});
