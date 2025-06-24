const request = require('supertest');
const app = require('../../src/app');
const engagementRecordingService = require('../../src/services/engagementRecordingService');

// Mock the engagement recording service
jest.mock('../../src/services/engagementRecordingService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Script Controller - Engagement Recording', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/scripts/:id/record-engagement', () => {
    const mockScriptId = '123e4567-e89b-12d3-a456-426614174000';
    const validYouTubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    test('should successfully record engagement with valid inputs', async () => {
      const mockResponse = {
        data: {
          id: mockScriptId,
          published_video_id: 'dQw4w9WgXcQ',
          views: 1000000,
          likes: 50000,
          comments: 2500,
          engagement_rate: 5.25,
          engagement_retrieved_at: '2025-06-24T04:00:00.000Z'
        },
        error: null
      };

      engagementRecordingService.recordEngagement.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
        .send({ videoUrl: validYouTubeUrl })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResponse.data
      });
      expect(engagementRecordingService.recordEngagement).toHaveBeenCalledWith(
        mockScriptId,
        validYouTubeUrl
      );
    });

    test('should return 400 for missing videoUrl', async () => {
      const response = await request(app)
        .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'The videoUrl field is required.'
      });
      expect(engagementRecordingService.recordEngagement).not.toHaveBeenCalled();
    });

    test('should return 400 for empty videoUrl', async () => {
      const response = await request(app)
        .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
        .send({ videoUrl: '' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'The videoUrl field is required.'
      });
      expect(engagementRecordingService.recordEngagement).not.toHaveBeenCalled();
    });

    test('should return 400 for invalid YouTube URL', async () => {
      const mockErrorResponse = {
        data: null,
        error: {
          message: 'Invalid YouTube URL provided. Could not extract video ID.',
          status: 400
        }
      };

      engagementRecordingService.recordEngagement.mockResolvedValue(mockErrorResponse);

      const response = await request(app)
        .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
        .send({ videoUrl: 'https://example.com/invalid' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: mockErrorResponse.error.message
      });
    });

    test('should return 404 for video not found', async () => {
      const mockErrorResponse = {
        data: null,
        error: {
          message: 'Could not retrieve video statistics from YouTube. The video may be private, deleted, or have stats disabled.',
          status: 404
        }
      };

      engagementRecordingService.recordEngagement.mockResolvedValue(mockErrorResponse);

      const response = await request(app)
        .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
        .send({ videoUrl: validYouTubeUrl })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: mockErrorResponse.error.message
      });
    });

    test('should return 404 for script not found', async () => {
      const mockErrorResponse = {
        data: null,
        error: {
          message: 'Script with ID 123e4567-e89b-12d3-a456-426614174000 not found for update.',
          status: 404
        }
      };

      engagementRecordingService.recordEngagement.mockResolvedValue(mockErrorResponse);

      const response = await request(app)
        .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
        .send({ videoUrl: validYouTubeUrl })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: mockErrorResponse.error.message
      });
    });

    test('should return 500 for internal server errors', async () => {
      const mockErrorResponse = {
        data: null,
        error: {
          message: 'An unexpected error occurred while recording engagement for scriptId 123e4567-e89b-12d3-a456-426614174000.',
          status: 500
        }
      };

      engagementRecordingService.recordEngagement.mockResolvedValue(mockErrorResponse);

      const response = await request(app)
        .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
        .send({ videoUrl: validYouTubeUrl })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: mockErrorResponse.error.message
      });
    });

    test('should handle malformed script ID', async () => {
      const invalidScriptId = 'invalid-uuid';
      
      const mockErrorResponse = {
        data: null,
        error: {
          message: 'Script ID and YouTube URL are required.',
          status: 400
        }
      };

      engagementRecordingService.recordEngagement.mockResolvedValue(mockErrorResponse);

      const response = await request(app)
        .post(`/api/v1/scripts/${invalidScriptId}/record-engagement`)
        .send({ videoUrl: validYouTubeUrl })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: mockErrorResponse.error.message
      });
    });

    test('should handle service throwing unexpected errors', async () => {
      engagementRecordingService.recordEngagement.mockRejectedValue(
        new Error('Unexpected service error')
      );

      const response = await request(app)
        .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
        .send({ videoUrl: validYouTubeUrl })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'An unexpected server error occurred in handleRecordEngagement for scriptId: 123e4567-e89b-12d3-a456-426614174000'
      });
    });

    test('should handle various YouTube URL formats', async () => {
      const urlFormats = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ'
      ];

      const mockResponse = {
        data: {
          id: mockScriptId,
          published_video_id: 'dQw4w9WgXcQ',
          engagement_rate: 5.25
        },
        error: null
      };

      engagementRecordingService.recordEngagement.mockResolvedValue(mockResponse);

      for (const url of urlFormats) {
        const response = await request(app)
          .post(`/api/v1/scripts/${mockScriptId}/record-engagement`)
          .send({ videoUrl: url })
          .expect(200);

        expect(response.body).toEqual({
          success: true,
          data: mockResponse.data
        });
      }

      expect(engagementRecordingService.recordEngagement).toHaveBeenCalledTimes(urlFormats.length);
    });
  });
});
