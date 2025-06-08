const express = require('express');
const scriptController = require('../controllers/scriptController');

// --- BEGIN G.O.A.T. C.O.D.E.X. B.O.T. DIAGNOSTIC LOG --- 
console.log('================================================================================');
console.log('[scriptRoutes.js] DIAGNOSTIC: Checking imported scriptController...');
if (scriptController) {
  console.log('[scriptRoutes.js] DIAGNOSTIC: scriptController object IS imported.');
  console.log('[scriptRoutes.js] DIAGNOSTIC: typeof scriptController.handleGenerateScript:', typeof scriptController.handleGenerateScript);
  console.log('[scriptRoutes.js] DIAGNOSTIC: typeof scriptController.handleGetAllScripts:', typeof scriptController.handleGetAllScripts);
  console.log('[scriptRoutes.js] DIAGNOSTIC: typeof scriptController.handleGetScriptById:', typeof scriptController.handleGetScriptById);
  console.log('[scriptRoutes.js] DIAGNOSTIC: typeof scriptController.handleModifyScript:', typeof scriptController.handleModifyScript);
  // Log all keys to see what's actually available if a specific function is undefined
  console.log('[scriptRoutes.js] DIAGNOSTIC: Keys in scriptController:', Object.keys(scriptController));
} else {
  console.error('[scriptRoutes.js] CRITICAL DIAGNOSTIC: scriptController object FAILED TO IMPORT and is undefined/null.');
}
console.log('================================================================================');
// --- END G.O.A.T. C.O.D.E.X. B.O.T. DIAGNOSTIC LOG ---

const {
  handleGenerateScript,
  handleGetAllScripts,
  handleGetScriptById,
  handleModifyScript,
} = scriptController; // Destructure after logging and from the already required object

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

/**
 * @swagger
 * /api/v1/scripts/modify:
 *   post:
 *     summary: Modify an existing script with selected keywords
 *     tags: [Scripts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - existingScript
 *               - selectedKeywords
 *             properties:
 *               existingScript:
 *                 type: string
 *                 description: The existing script content to be modified.
 *                 example: "Hello everyone, today we're talking about AI."
 *               selectedKeywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of keywords selected by the user to infuse into the script.
 *                 example: ["machine learning", "neural networks", "deep learning"]
 *     responses:
 *       200:
 *         description: Script modified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modifiedScript:
 *                   type: string
 *                   description: The script after infusing the selected keywords.
 *                   example: "Hello everyone, today we're diving deep into AI, specifically machine learning and neural networks!"
 *                 originalScript:
 *                   type: string
 *                   description: The original script provided by the user.
 *                 keywordsUsed:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The keywords that were infused into the script.
 *       400:
 *         description: Bad request (e.g., missing parameters).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/modify', handleModifyScript);

module.exports = router;
