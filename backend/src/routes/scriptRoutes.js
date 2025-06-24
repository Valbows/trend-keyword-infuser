const express = require('express');
const router = express.Router();
const {
  handleGenerateScript,
  handleGetAllScripts,
  handleGetScriptById,
  handleModifyScript,
  handleUpdateScriptContent,
  handleRecordEngagement,
} = require('../controllers/scriptController');

// G.O.A.T. C.O.D.E.X. B.O.T. - Defining 'Durable' and 'Xtensible' routes

// Route to generate a new script
router.post('/generate', handleGenerateScript);

// Route to get all scripts
router.get('/', handleGetAllScripts);

// Route to get a single script by its ID
router.get('/:id', handleGetScriptById);

// Route to modify a script with keywords
router.post('/modify', handleModifyScript);

// Route to update the content of a script
router.put('/:id/content', handleUpdateScriptContent);

// 'Tactical' new route to record YouTube engagement for a script
router.post('/:id/record-engagement', handleRecordEngagement);

module.exports = router;
