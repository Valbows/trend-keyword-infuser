const express = require('express');
const router = express.Router();
const trendController = require('../controllers/trendController'); // We will create this next

// Route for fetching trends
// GET /api/v1/trends?topic=...
router.get('/', trendController.getTrends);

module.exports = router;
