const trendService = require('../services/trendService');

const getTrends = async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return res.status(400).json({ error: 'Missing required query parameter: topic' });
  }

  try {
    const trends = await trendService.fetchTrendsFromSources(topic);
    res.status(200).json({ trends });
  } catch (error) {
    console.error('Error in trendController fetching trends:', error.message);
    // It's good practice to not expose internal server errors directly to the client.
    // Log the actual error and return a generic error message.
    res.status(500).json({ error: 'Failed to fetch trends due to an internal server error' });
  }
};

module.exports = {
  getTrends,
};
