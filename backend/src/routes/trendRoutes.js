const express = require('express');
const router = express.Router();
const trendController = require('../controllers/trendController'); // For topic-specific trends (e.g., YouTube)
const logger = require('../utils/logger'); // Import the logger

// Middleware to log requests to this router
router.use((req, res, next) => {
  logger.info(`[TrendRoutes] Received request: ${req.method} ${req.originalUrl} (Path: ${req.path})`);
  next();
});

// Route for fetching trends
// GET /api/v1/trends?topic=...
router.get('/', trendController.getTrends);

// Route for fetching YouTube keywords based on topic and timeframe
// GET /api/v1/trends/youtube-keywords?topic=...&timeframe=...
router.get('/youtube-keywords', trendController.getYouTubeKeywords);

module.exports = router;
