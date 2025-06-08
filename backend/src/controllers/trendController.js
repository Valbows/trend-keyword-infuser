const trendService = require('../services/trendService'); // This seems to be for a general trend service
const TrendDiscoveryService = require('../services/TrendDiscoveryService'); // Our service for YouTube specific trends/keywords
const logger = require('../utils/logger');

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
  const { topic, timeframe = 'any', publishedAfterISO, publishedBeforeISO } = req.query;

  if (!topic) {
    logger.warn('[trendController.getYouTubeKeywords] Missing required query parameter: topic');
    return res.status(400).json({ error: 'Missing required query parameter: topic' });
  }

  // Validate timeframe
  const validTimeframes = ['24h', '48h', '72h', 'any'];
  if (publishedAfterISO && publishedBeforeISO) {
    // If custom dates are provided, timeframe can be 'custom' or one of the validTimeframes (though less meaningful).
    // The primary determinants are publishedAfterISO and publishedBeforeISO.
    // We won't strictly enforce timeframe to be 'custom' here, but log if it's unexpected.
    if (timeframe && timeframe !== 'custom' && !validTimeframes.includes(timeframe)) {
      logger.warn(`[trendController.getYouTubeKeywords] Received timeframe '${timeframe}' with custom dates. Proceeding with custom dates.`);
      // Not returning an error, as custom dates take precedence.
    }
    logger.info(`[trendController.getYouTubeKeywords] Custom date range provided: ${publishedAfterISO} to ${publishedBeforeISO}`);
  } else if (!validTimeframes.includes(timeframe)) {
    // If no custom dates, timeframe must be one of the predefined valid values.
    logger.warn(`[trendController.getYouTubeKeywords] Invalid timeframe: ${timeframe} (no custom dates provided)`);
    return res.status(400).json({ error: `Invalid timeframe parameter. Valid values are: ${validTimeframes.join(', ')} when no custom dates are specified.` });
  }

  try {
    logger.info(`[trendController.getYouTubeKeywords] Fetching YouTube keywords for topic: "${topic}", timeframe: "${timeframe}", publishedAfter: "${publishedAfterISO}", publishedBefore: "${publishedBeforeISO}"`);
    const keywords = await TrendDiscoveryService.getYouTubeKeywordsByTopicAndTimeframe(
      topic,
      timeframe, // Pass timeframe along; service will decide how to use it with custom dates
      publishedAfterISO, // Pass custom start date
      publishedBeforeISO   // Pass custom end date
    );
    res.status(200).json({ 
      topic, 
      timeframe, 
      keywords, 
      // Include these in response if they were part of the request, for clarity
      ...(publishedAfterISO && { publishedAfterISO }), 
      ...(publishedBeforeISO && { publishedBeforeISO })
    });
  } catch (error) {
    logger.error('[trendController.getYouTubeKeywords] Error fetching YouTube keywords:', { message: error.message, topic, timeframe, stack: error.stack });
    res.status(500).json({ error: 'Failed to fetch YouTube keywords due to an internal server error' });
  }
};

module.exports = {
  getTrends,
  getYouTubeKeywords,
};
