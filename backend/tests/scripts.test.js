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
    const orchestratedScriptData = {
      script: mockGeneratedScript,
      scriptId: 'orchestration-mock-id-1',
      topic: mockTopic,
    };
    scriptOrchestrationService.orchestrateScriptCreation.mockResolvedValue(
      orchestratedScriptData
    );

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: orchestratedScriptData,
    });
    expect(
      scriptOrchestrationService.orchestrateScriptCreation
    ).toHaveBeenCalledWith(mockTopic, mockTrends);
  });

  it('should generate a script successfully with only a topic (empty trends)', async () => {
    const orchestratedScriptData = {
      script: mockGeneratedScript,
      scriptId: 'orchestration-mock-id-2',
      topic: mockTopic,
    };
    scriptOrchestrationService.orchestrateScriptCreation.mockResolvedValue(
      orchestratedScriptData
    );

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic }); // No trends array sent

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: orchestratedScriptData,
    });
    expect(
      scriptOrchestrationService.orchestrateScriptCreation
    ).toHaveBeenCalledWith(mockTopic, []);
  });

  it('should return 400 if topic is missing', async () => {
    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ trends: mockTrends }); // Missing topic

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Missing required field: topic',
    });
    expect(
      scriptOrchestrationService.orchestrateScriptCreation
    ).not.toHaveBeenCalled();
  });

  it('should return 500 if GEMINI_API_KEY is not set in service', async () => {
    const error = new Error('GEMINI_API_KEY is not set.');
    error.status = 500; // Service should set status on error
    scriptOrchestrationService.orchestrateScriptCreation.mockRejectedValue(error);

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'GEMINI_API_KEY is not set.',
    });
  });

  it('should return 502 if Gemini API returns an invalid response', async () => {
    const error = new Error(
      'Failed to get valid script content from Gemini API response.'
    );
    error.status = 502; // Service should set status on error
    scriptOrchestrationService.orchestrateScriptCreation.mockRejectedValue(error);

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      success: false,
      message:
        'Failed to get valid script content from Gemini API response.',
    });
  });

  it('should return 500 for other service errors', async () => {
    const error = new Error('Some other internal service error.');
    error.status = 500; // Service should set status on error
    scriptOrchestrationService.orchestrateScriptCreation.mockRejectedValue(error);

    const response = await request(app)
      .post('/api/v1/scripts/generate')
      .send({ topic: mockTopic, trends: mockTrends });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'Some other internal service error.',
    });
  });
});
