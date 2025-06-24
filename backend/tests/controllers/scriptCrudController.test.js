const request = require('supertest');
const express = require('express');
const scriptController = require('../../src/controllers/scriptController');
const scriptOrchestrationService = require('../../src/services/scriptOrchestrationService');
const scriptPersistenceService = require('../../src/services/scriptPersistenceService');

// Mock the services
jest.mock('../../src/services/scriptOrchestrationService');
jest.mock('../../src/services/scriptPersistenceService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const app = express();
app.use(express.json());
app.post('/scripts', scriptController.handleGenerateScript);
app.get('/scripts', scriptController.handleGetAllScripts);
app.get('/scripts/:id', scriptController.handleGetScriptById);
app.put('/scripts/:id', scriptController.handleUpdateScriptContent);

describe('Script CRUD Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /scripts (handleGenerateScript)', () => {
    it('should generate a script and return 200', async () => {
      const mockResponse = {
        scriptId: '123',
        script: 'A new script',
        topic: 'AI',
      };
      scriptOrchestrationService.orchestrateScriptCreation.mockResolvedValue(
        mockResponse
      );

      const res = await request(app)
        .post('/scripts')
        .send({ topic: 'AI', trends: [] });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockResponse });
      expect(
        scriptOrchestrationService.orchestrateScriptCreation
      ).toHaveBeenCalledWith('AI', []);
    });

    it('should return 400 if topic is missing', async () => {
      const res = await request(app).post('/scripts').send({ trends: [] });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Missing required field: topic',
      });
    });

    it('should return 500 on service error', async () => {
      scriptOrchestrationService.orchestrateScriptCreation.mockRejectedValue(
        new Error('Service failure')
      );

      const res = await request(app)
        .post('/scripts')
        .send({ topic: 'AI', trends: [] });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, message: 'Service failure' });
    });
  });

  describe('GET /scripts (handleGetAllScripts)', () => {
    it('should return all scripts and status 200', async () => {
      const mockScripts = [
        { id: '1', topic: 'AI' },
        { id: '2', topic: 'Tech' },
      ];
      scriptPersistenceService.getAllScripts.mockResolvedValue(mockScripts);

      const res = await request(app).get('/scripts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockScripts });
    });

    it('should return 500 on service error', async () => {
      scriptPersistenceService.getAllScripts.mockRejectedValue(
        new Error('DB error')
      );

      const res = await request(app).get('/scripts');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'Failed to retrieve scripts.',
      });
    });
  });

  describe('GET /scripts/:id (handleGetScriptById)', () => {
    it('should return a script by ID and status 200', async () => {
      const mockScript = { id: '1', topic: 'AI' };
      scriptPersistenceService.getScriptById.mockResolvedValue(mockScript);

      const res = await request(app).get('/scripts/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockScript });
    });

    it('should return 404 if script not found', async () => {
      const error = new Error('Script not found.');
      error.status = 404;
      scriptPersistenceService.getScriptById.mockRejectedValue(error);

      const res = await request(app).get('/scripts/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Script not found.',
      });
    });
  });

  describe('PUT /scripts/:id (handleUpdateScriptContent)', () => {
    it('should update a script and return 200', async () => {
      const updatedScript = { id: '1', generated_script: 'Updated content' };
      scriptPersistenceService.updateScriptContent.mockResolvedValue(
        updatedScript
      );

      const res = await request(app)
        .put('/scripts/1')
        .send({ content: 'Updated content' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: updatedScript });
    });

    it('should return 400 if content is not a string', async () => {
      const res = await request(app).put('/scripts/1').send({ content: 123 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Invalid request body: content must be a string.',
      });
    });

    it('should return 404 if script to update is not found', async () => {
      const error = new Error('Script not found');
      error.status = 404;
      scriptPersistenceService.updateScriptContent.mockRejectedValue(error);

      const res = await request(app)
        .put('/scripts/999')
        .send({ content: 'data' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, message: 'Script not found' });
    });
  });
});
