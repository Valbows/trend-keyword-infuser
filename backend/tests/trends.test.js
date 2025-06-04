const request = require('supertest');
const app = require('../src/app');
const Parser = require('rss-parser');
const { google } = require('googleapis'); // Import for mocking

// Mock the rss-parser module
jest.mock('rss-parser');
// Mock the googleapis module
jest.mock('googleapis', () => {
  const mockYoutube = {
    search: {
      list: jest.fn(),
    },
  };
  return {
    google: {
      youtube: jest.fn(() => mockYoutube),
    },
  };
});

let originalYoutubeApiKey;

describe('GET /api/v1/trends', () => {
  beforeAll(() => {
    originalYoutubeApiKey = process.env.YOUTUBE_API_KEY;
    process.env.YOUTUBE_API_KEY = 'dummy_youtube_api_key_for_testing'; // Set dummy key for tests
  });

  afterAll(() => {
    process.env.YOUTUBE_API_KEY = originalYoutubeApiKey; // Restore original key
  });
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods: jest.clearAllMocks();
    // Reset any mocked implementations: Parser.prototype.parseURL.mockReset();
    // Or, more simply for this case, reset the mock for parseURL
    Parser.prototype.parseURL.mockReset();
    // Reset the youtube mock before each test
    const mockYoutube = google.youtube(); // Get the mocked instance
    mockYoutube.search.list.mockReset();
  });

  it('should return 400 if topic query parameter is missing', async () => {
    const res = await request(app).get('/api/v1/trends');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Missing required query parameter: topic');
  });

  it('should return 200 and combined trend data if topic is provided', async () => {
    // Mock Google Trends Data
    const mockGoogleFeedItems = [
      { title: 'Google Trend 1', link: 'http://google.com/trend1', pubDate: new Date().toISOString(), contentSnippet: 'Google Snippet 1' },
    ];
    Parser.prototype.parseURL.mockResolvedValue({ items: mockGoogleFeedItems });

    // Mock YouTube Data
    const mockYouTubeItems = [
      { id: { videoId: 'yt1' }, snippet: { title: 'YouTube Trend 1', publishedAt: new Date().toISOString(), description: 'YT Desc 1', thumbnails: { default: { url: 'http://yt.com/thumb1.jpg' } } } },
    ];
    const mockYoutubeClient = google.youtube();
    mockYoutubeClient.search.list.mockResolvedValue({ data: { items: mockYouTubeItems } });

    const res = await request(app).get('/api/v1/trends?topic=AI');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('trends');
    expect(Array.isArray(res.body.trends)).toBe(true);
    expect(res.body.trends.length).toBe(mockGoogleFeedItems.length + mockYouTubeItems.length);

    const googleTrendResult = res.body.trends.find(t => t.source === 'Google Trends');
    expect(googleTrendResult).toBeDefined();
    expect(googleTrendResult.keyword).toBe(mockGoogleFeedItems[0].title);

    const youtubeTrendResult = res.body.trends.find(t => t.source === 'YouTube');
    expect(youtubeTrendResult).toBeDefined();
    expect(youtubeTrendResult.keyword).toBe(mockYouTubeItems[0].snippet.title);

    // Verify mocks were called
    expect(Parser.prototype.parseURL).toHaveBeenCalledTimes(1);
    expect(mockYoutubeClient.search.list).toHaveBeenCalledTimes(1);
    expect(mockYoutubeClient.search.list).toHaveBeenCalledWith({
      part: 'snippet',
      q: 'AI trending',
      type: 'video',
      order: 'viewCount',
      maxResults: 5,
      regionCode: 'US',
      relevanceLanguage: 'en',
    });
  });

  it('should return 200 and only YouTube trends if Google Trends RSS feed returns no items', async () => {
    Parser.prototype.parseURL.mockResolvedValue({ items: [] }); // Mock empty Google Trends

    const mockYouTubeItems = [
      { id: { videoId: 'ytTech' }, snippet: { title: 'Tech YouTube Trend', publishedAt: new Date().toISOString(), description: 'Tech YT Desc', thumbnails: { default: { url: 'http://yt.com/thumbTech.jpg' } } } },
    ];
    const mockYoutubeClient = google.youtube();
    mockYoutubeClient.search.list.mockResolvedValue({ data: { items: mockYouTubeItems } });

    const res = await request(app).get('/api/v1/trends?topic=Technology');
    expect(res.statusCode).toEqual(200);
    expect(res.body.trends.length).toBe(1);
    expect(res.body.trends[0].source).toBe('YouTube');
  });

  it('should return 200 and only YouTube trends if Google Trends RSS fetching fails', async () => {
    Parser.prototype.parseURL.mockRejectedValue(new Error('Network error')); // Mock Google Trends failure

    const mockYouTubeItems = [
      { id: { videoId: 'ytFinance' }, snippet: { title: 'Finance YouTube Trend', publishedAt: new Date().toISOString(), description: 'Finance YT Desc', thumbnails: { default: { url: 'http://yt.com/thumbFinance.jpg' } } } },
    ];
    const mockYoutubeClient = google.youtube();
    mockYoutubeClient.search.list.mockResolvedValue({ data: { items: mockYouTubeItems } });

    const res = await request(app).get('/api/v1/trends?topic=Finance');
    expect(res.statusCode).toEqual(200);
    expect(res.body.trends.length).toBe(1);
    expect(res.body.trends[0].source).toBe('YouTube');
  });

  it('should return 200 and only Google trends if YouTube fetching fails', async () => {
    const mockGoogleFeedItems = [
      { title: 'Google Trend Error Case', link: 'http://google.com/trendError', pubDate: new Date().toISOString(), contentSnippet: 'Google Snippet Error' },
    ];
    Parser.prototype.parseURL.mockResolvedValue({ items: mockGoogleFeedItems });

    const mockYoutubeClient = google.youtube();
    mockYoutubeClient.search.list.mockRejectedValue(new Error('YouTube API Error'));

    const res = await request(app).get('/api/v1/trends?topic=ErrorHandling');
    expect(res.statusCode).toEqual(200);
    expect(res.body.trends.length).toBe(1);
    expect(res.body.trends[0].source).toBe('Google Trends');
  });

  it('should return 200 and an empty array if both sources fail', async () => {
    Parser.prototype.parseURL.mockRejectedValue(new Error('Network error'));
    const mockYoutubeClient = google.youtube();
    mockYoutubeClient.search.list.mockRejectedValue(new Error('YouTube API Error'));

    const res = await request(app).get('/api/v1/trends?topic=TotalFailure');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('trends', []);
  });

  // Add more tests later for platform, specific data sources, etc.
});
