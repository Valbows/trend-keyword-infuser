const trendService = require('../services/trendService'); // This seems to be for a general trend service
const TrendDiscoveryService = require('../services/TrendDiscoveryService'); // Our service for YouTube specific trends/keywords
const logger = require('../utils/logger');
const cache = require('../services/cacheService');

const getTrends = async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Missing required query parameter: topic' });
  }

  try {
    const trends = await trendService.fetchTrendsFromSources(topic);
    res.status(200).json({ trends });
  } catch (error) {
    logger.error('Error in trendController fetching trends:', { message: error.message, stack: error.stack });
    // It's good practice to not expose internal server errors directly to the client.
    // Log the actual error and return a generic error message.
    res.status(500).json({ error: 'Failed to fetch trends due to an internal server error' });
  }
};

const getYouTubeKeywords = async (req, res) => {
  logger.info('[trendController.getYouTubeKeywords] Received request with query parameters:', req.query);
  const { topic, timeframe = 'any', publishedAfterISO, publishedBeforeISO } = req.query;

  if (!topic) {
    logger.warn('[trendController.getYouTubeKeywords] Missing required query parameter: topic');
    return res.status(400).json({ error: 'Missing required query parameter: topic' });
  }

  const validTimeframes = ['24h', '48h', '72h', 'any'];
  if (!(publishedAfterISO && publishedBeforeISO) && !validTimeframes.includes(timeframe)) {
    logger.warn(`[trendController.getYouTubeKeywords] Invalid timeframe: ${timeframe}`);
    return res.status(400).json({ error: `Invalid timeframe. Valid values are: ${validTimeframes.join(', ')}.` });
  }

  const cacheKey = `youtube-keywords:${topic}:${timeframe}:${publishedAfterISO || ''}:${publishedBeforeISO || ''}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    logger.info(`[trendController.getYouTubeKeywords] Serving from cache for key: ${cacheKey}`);
    return res.status(200).json(cachedData);
  }

  try {
    logger.info(`[trendController.getYouTubeKeywords] Fetching fresh YouTube keywords for topic: "${topic}"`);
    const keywords = await TrendDiscoveryService.getYouTubeKeywordsByTopicAndTimeframe(
      topic,
      timeframe,
      publishedAfterISO,
      publishedBeforeISO
    );

    const responseData = {
      topic,
      timeframe,
      keywords,
      ...(publishedAfterISO && { publishedAfterISO }),
      ...(publishedBeforeISO && { publishedBeforeISO })
    };

    // Cache for 1 hour (3600 * 1000 ms)
    cache.set(cacheKey, responseData, 3600000);
    logger.info(`[trendController.getYouTubeKeywords] Caching new data for key: ${cacheKey}`);

    res.status(200).json(responseData);
  } catch (error) {
    logger.error('[trendController.getYouTubeKeywords] Error fetching YouTube keywords:', { message: error.message, topic, timeframe, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch YouTube keywords due to an internal server error' });
  }
};

module.exports = {
  getTrends,
  getYouTubeKeywords,
};
