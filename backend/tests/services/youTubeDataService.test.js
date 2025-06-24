// Mock environment variables before importing the service
process.env.YOUTUBE_API_KEY = 'test-api-key';

// Mock the googleapis module
jest.mock('googleapis', () => ({
  google: {
    youtube: jest.fn(() => ({
      videos: {
        list: jest.fn(),
      },
    })),
  },
}));

// Mock logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

const YouTubeDataService = require('../../src/services/youTubeDataService');

describe('YouTubeDataService', () => {
  describe('extractYouTubeVideoId', () => {
    test('should extract video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from YouTube short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from YouTube URL with additional parameters', () => {
      const url =
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLxyz';
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from YouTube embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should extract video ID from mobile YouTube URL', () => {
      const url = 'https://m.youtube.com/watch?v=dQw4w9WgXcQ';
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBe('dQw4w9WgXcQ');
    });

    test('should return null for invalid YouTube URL', () => {
      const url = 'https://www.example.com/video';
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBeNull();
    });

    test('should return null for malformed YouTube URL', () => {
      const url = 'https://www.youtube.com/watch';
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBeNull();
    });

    test('should return null for empty string', () => {
      const url = '';
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBeNull();
    });

    test('should return null for null input', () => {
      const url = null;
      const videoId = YouTubeDataService.extractYouTubeVideoId(url);
      expect(videoId).toBeNull();
    });
  });

  describe('getVideoStatistics', () => {
    // Mock the YouTube API calls for testing
    beforeEach(() => {
      // Reset any mocks before each test
      jest.clearAllMocks();
    });

    test('should return statistics for valid video ID', async () => {
      // Mock the YouTube API response
      const mockStats = {
        views: 1000000,
        likes: 50000,
        comments: 2500,
      };

      // Mock the internal API call
      const originalGetVideoStatistics = YouTubeDataService.getVideoStatistics;
      YouTubeDataService.getVideoStatistics = jest
        .fn()
        .mockResolvedValue(mockStats);

      const result = await YouTubeDataService.getVideoStatistics('dQw4w9WgXcQ');

      expect(result).toEqual(mockStats);
      expect(YouTubeDataService.getVideoStatistics).toHaveBeenCalledWith(
        'dQw4w9WgXcQ'
      );

      // Restore original method
      YouTubeDataService.getVideoStatistics = originalGetVideoStatistics;
    });

    test('should handle API errors gracefully', async () => {
      // Mock API error
      const originalGetVideoStatistics = YouTubeDataService.getVideoStatistics;
      YouTubeDataService.getVideoStatistics = jest
        .fn()
        .mockRejectedValue(new Error('API Error'));

      await expect(
        YouTubeDataService.getVideoStatistics('invalid-id')
      ).rejects.toThrow('API Error');

      // Restore original method
      YouTubeDataService.getVideoStatistics = originalGetVideoStatistics;
    });
  });
});
