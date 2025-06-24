const trendService = require('../services/trendService'); // This seems to be for a general trend service
const trendDiscoveryService = require('../services/trendDiscoveryService'); // Our service for YouTube specific trends/keywords
const logger = require('../utils/logger');


const getTrends = async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res
      .status(400)
      .json({ error: 'Missing required query parameter: topic' });
  }

  try {
    const trends = await trendService.fetchTrendsFromSources(topic);
    res.status(200).json({ trends });
  } catch (error) {
    logger.error('Error in trendController fetching trends:', {
      message: error.message,
      stack: error.stack,
    });
    // It's good practice to not expose internal server errors directly to the client.
    // Log the actual error and return a generic error message.
    res.status(500).json({
      error: 'Failed to fetch trends due to an internal server error',
    });
  }
};

const getYouTubeKeywords = async (req, res) => {
  logger.info(
    '[trendController.getYouTubeKeywords] Received request with query parameters:',
    req.query
  );
  const {
    topic,
    timeframe = 'any',
    publishedAfterISO,
    publishedBeforeISO,
  } = req.query;

  if (!topic) {
    logger.warn(
      '[trendController.getYouTubeKeywords] Missing required query parameter: topic'
    );
    return res
      .status(400)
      .json({ error: 'Missing required query parameter: topic' });
  }

  const validTimeframes = ['24h', '48h', '72h', 'any'];
  if (
    !(publishedAfterISO && publishedBeforeISO) &&
    !validTimeframes.includes(timeframe)
  )
  {
    logger.warn(
      `[trendController.getYouTubeKeywords] Invalid timeframe: ${timeframe}`
    );
    return res.status(400).json({
      error: `Invalid timeframe. Valid values are: ${validTimeframes.join(', ')}.`, 
    });
  }

  try {
    const responseData =
      await trendDiscoveryService.getYouTubeKeywordsByTopicAndTimeframe(
        topic,
        timeframe,
        publishedAfterISO,
        publishedBeforeISO
      );

    res.status(200).json(responseData);
  } catch (error) {
    logger.error(
      '[trendController.getYouTubeKeywords] Error fetching YouTube keywords:',
      { message: error.message, topic, timeframe, stack: error.stack }
    );
    res.status(500).json({
      error: 'Failed to fetch YouTube keywords due to an internal server error',
    });
  }
};

module.exports = {
  getTrends,
  getYouTubeKeywords,
};
