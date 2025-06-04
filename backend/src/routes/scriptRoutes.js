const express = require('express');
const {
  handleGenerateScript,
  handleGetAllScripts,
  handleGetScriptById,
} = require('../controllers/scriptController');

const router = express.Router();

/**
 * @swagger
 * /api/scripts/generate:
 *   post:
 *     summary: Generate a video script
 *     tags: [Scripts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *                 description: The main topic for the script.
 *                 example: "Future of Renewable Energy"
 *               trends:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     keyword:
 *                       type: string
 *                       example: "Solar Panel Efficiency"
 *                     snippet:
 *                       type: string
 *                       example: "New breakthroughs in solar panel efficiency are making them more affordable."
 *                     source:
 *                       type: string
 *                       example: "Tech News"
 *                     pubDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-05-15T10:00:00Z"
 *                 description: Optional. A list of current trends related to the topic.
 *     responses:
 *       200:
 *         description: Script generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 script:
 *                   type: string
 *                   example: "Welcome to our channel! Today we're exploring the Future of Renewable Energy..."
 *       400:
 *         description: Bad request (e.g., missing topic).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error or script generation service configuration issue.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       502:
 *         description: Bad gateway (e.g., AI service response issue).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/generate', handleGenerateScript);

// GET /api/scripts - Retrieve all scripts
router.get('/', handleGetAllScripts);

// GET /api/scripts/:id - Retrieve a single script by its ID
router.get('/:id', handleGetScriptById);

module.exports = router;
