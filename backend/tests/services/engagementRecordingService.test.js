const engagementRecordingService = require('../../src/services/engagementRecordingService');
const youTubeDataService = require('../../src/services/youTubeDataService');
const supabase = require('../../src/config/supabaseClient');

// Mock dependencies
jest.mock('../../src/services/youTubeDataService');
jest.mock('../../src/config/supabaseClient');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('EngagementRecordingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordEngagement', () => {
    const mockScriptId = '123e4567-e89b-12d3-a456-426614174000';
    const mockYouTubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const mockVideoId = 'dQw4w9WgXcQ';

    test('should successfully record engagement for valid inputs', async () => {
      // Mock YouTube service responses
      youTubeDataService.extractYouTubeVideoId.mockReturnValue(mockVideoId);
      youTubeDataService.getVideoStatistics.mockResolvedValue({
        views: 1000000,
        likes: 50000,
        comments: 2500,
      });

      // Mock Supabase responses
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const mockUpdateResponse = {
        from: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: mockScriptId,
                    published_video_id: mockVideoId,
                    views: 1000000,
                    likes: 50000,
                    comments: 2500,
                    engagement_rate: 5.25,
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      // Override the second supabase call for the actual update
      supabase.from
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              neq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce(mockUpdateResponse.from());

      const result = await engagementRecordingService.recordEngagement(
        mockScriptId,
        mockYouTubeUrl
      );

      expect(result.error).toBeNull();
      expect(result.data).toBeDefined();
      expect(result.data.engagement_rate).toBe(5.25);
      expect(youTubeDataService.extractYouTubeVideoId).toHaveBeenCalledWith(
        mockYouTubeUrl
      );
      expect(youTubeDataService.getVideoStatistics).toHaveBeenCalledWith(
        mockVideoId
      );
    });

    test('should calculate engagement rate correctly', async () => {
      const views = 1000;
      const likes = 50;
      const comments = 25;
      const expectedEngagementRate = ((likes + comments) / views) * 100; // 7.5%

      youTubeDataService.extractYouTubeVideoId.mockReturnValue(mockVideoId);
      youTubeDataService.getVideoStatistics.mockResolvedValue({
        views,
        likes,
        comments,
      });

      // Mock Supabase clearing existing assignments
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      // Mock Supabase update response
      const mockUpdateResponse = {
        from: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: mockScriptId,
                    engagement_rate: parseFloat(
                      expectedEngagementRate.toFixed(2)
                    ),
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      supabase.from
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              neq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce(mockUpdateResponse.from());

      const result = await engagementRecordingService.recordEngagement(
        mockScriptId,
        mockYouTubeUrl
      );

      expect(result.data.engagement_rate).toBe(7.5);
    });

    test('should handle zero views gracefully', async () => {
      youTubeDataService.extractYouTubeVideoId.mockReturnValue(mockVideoId);
      youTubeDataService.getVideoStatistics.mockResolvedValue({
        views: 0,
        likes: 50,
        comments: 25,
      });

      // Mock Supabase responses
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const mockUpdateResponse = {
        from: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: mockScriptId,
                    engagement_rate: 0,
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      supabase.from
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              neq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce(mockUpdateResponse.from());

      const result = await engagementRecordingService.recordEngagement(
        mockScriptId,
        mockYouTubeUrl
      );

      expect(result.data.engagement_rate).toBe(0);
    });

    test('should return error for missing scriptId', async () => {
      const result = await engagementRecordingService.recordEngagement(
        null,
        mockYouTubeUrl
      );

      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain(
        'Script ID and YouTube URL are required'
      );
      expect(result.data).toBeNull();
    });

    test('should return error for missing youtubeUrl', async () => {
      const result = await engagementRecordingService.recordEngagement(
        mockScriptId,
        null
      );

      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain(
        'Script ID and YouTube URL are required'
      );
      expect(result.data).toBeNull();
    });

    test('should return error for invalid YouTube URL', async () => {
      youTubeDataService.extractYouTubeVideoId.mockReturnValue(null);

      const result = await engagementRecordingService.recordEngagement(
        mockScriptId,
        'https://example.com/invalid'
      );

      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(400);
      expect(result.error.message).toContain('Invalid YouTube URL');
      expect(result.data).toBeNull();
    });

    test('should return error when YouTube API fails', async () => {
      youTubeDataService.extractYouTubeVideoId.mockReturnValue(mockVideoId);
      youTubeDataService.getVideoStatistics.mockResolvedValue(null);

      const result = await engagementRecordingService.recordEngagement(
        mockScriptId,
        mockYouTubeUrl
      );

      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(404);
      expect(result.error.message).toContain(
        'Could not retrieve video statistics'
      );
      expect(result.data).toBeNull();
    });

    test('should handle database errors gracefully', async () => {
      youTubeDataService.extractYouTubeVideoId.mockReturnValue(mockVideoId);
      youTubeDataService.getVideoStatistics.mockResolvedValue({
        views: 1000,
        likes: 50,
        comments: 25,
      });

      // Mock database error
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest
              .fn()
              .mockRejectedValue(new Error('Database connection failed')),
          }),
        }),
      });

      const result = await engagementRecordingService.recordEngagement(
        mockScriptId,
        mockYouTubeUrl
      );

      expect(result.error).toBeDefined();
      expect(result.error.status).toBe(500);
      expect(result.error.message).toContain('An unexpected error occurred');
      expect(result.data).toBeNull();
    });
  });
});
