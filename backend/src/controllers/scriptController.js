const engagementRecordingService = require('../services/engagementRecordingService');
const scriptOrchestrationService = require('../services/scriptOrchestrationService');
const scriptPersistenceService = require('../services/scriptPersistenceService');
const logger = require('../utils/logger');

/**
 * Handles the request to record YouTube engagement for a specific script.
 * This function is 'Elegant' and 'Durable', ensuring robust error handling and clear responses.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
async function handleRecordEngagement(req, res) {
  const { id: scriptId } = req.params;
  const { videoUrl } = req.body;

  logger.info(`[ScriptController] Received request to record engagement for scriptId: ${scriptId}`);

  if (!videoUrl) {
    return res.status(400).json({ success: false, message: 'The videoUrl field is required.' });
  }

  try {
    const { data, error } = await engagementRecordingService.recordEngagement(scriptId, videoUrl);

    if (error) {
      logger.error(`[ScriptController] Error recording engagement for scriptId ${scriptId}: ${error.message}`);
      return res.status(error.status || 500).json({ success: false, message: error.message });
    }

    logger.info(`[ScriptController] Successfully recorded engagement for scriptId: ${scriptId}`);
    return res.status(200).json({ success: true, data });

  } catch (err) {
    const errorMsg = `An unexpected server error occurred in handleRecordEngagement for scriptId: ${scriptId}`;
    logger.error(`[ScriptController] ${errorMsg}`, err);
    return res.status(500).json({ success: false, message: errorMsg });
  }
}

/**
 * Handles the request to generate a video script.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const handleGenerateScript = async (req, res) => {
  const { topic, trends } = req.body;

  if (!topic) {
    return res.status(400).json({ success: false, message: 'Missing required field: topic' });
  }

  try {
    const responseData = await scriptOrchestrationService.orchestrateScriptCreation(topic, trends);
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    logger.error(`[ScriptController] Error generating script for topic "${topic}":`, error);
    const statusCode = error.status || 500;
    const message = error.message || 'Failed to generate script due to an internal server error.';
    res.status(statusCode).json({ success: false, message });
  }
};

const handleGetAllScripts = async (req, res) => {
  try {
    const scripts = await scriptPersistenceService.getAllScripts();
    res.status(200).json({ success: true, data: scripts });
  } catch (error) {
    logger.error('[ScriptController] Error fetching all scripts:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve scripts.' });
  }
};

const handleGetScriptById = async (req, res) => {
  const { id } = req.params;
  try {
    const script = await scriptPersistenceService.getScriptById(id);
    res.status(200).json({ success: true, data: script });
  } catch (error) {
    logger.error(`[ScriptController] Error fetching script with ID ${id}:`, error);
    const statusCode = error.status || 500;
    const message = error.message || 'Failed to retrieve script.';
    res.status(statusCode).json({ success: false, message });
  }
};

const handleModifyScript = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const { existingScript, selectedKeywords } = req.body;

  if (!existingScript || typeof existingScript !== 'string' || existingScript.trim() === '') {
    return res.status(400).json({
      error: 'Missing or invalid required field: existingScript (must be a non-empty string).',
    });
  }

  if (!selectedKeywords || !Array.isArray(selectedKeywords) || selectedKeywords.length === 0) {
    return res.status(400).json({
      error: 'Missing or invalid required field: selectedKeywords (must be a non-empty array of strings).',
    });
  }
  if (selectedKeywords.some((kw) => typeof kw !== 'string' || kw.trim() === '')) {
    return res.status(400).json({
      error: 'Invalid field: selectedKeywords must be an array of non-empty strings.',
    });
  }

  try {
    const { modifiedScriptText, savedScriptId } =
      await scriptOrchestrationService.orchestrateScriptModification(
        existingScript,
        selectedKeywords,
        userId
      );

    res.status(200).json({ 
      success: true, 
      data: {
        message: 'Script modified and saved successfully.',
        modifiedScript: modifiedScriptText,
        originalScript: existingScript,
        keywordsUsed: selectedKeywords,
        savedScriptId: savedScriptId,
      }
    });
  } catch (error) {
    logger.error('Error in scriptController handling script modification:', error);
    const errorMessageString = error && typeof error.message === 'string' ? error.message : '';

    if (errorMessageString.includes('GEMINI_API_KEY is not set')) {
      return res.status(500).json({
        error: 'Script modification service is not configured (API Key missing).',
      });
    } else if (errorMessageString.includes('Failed to get valid modified script content')) {
      return res.status(502).json({
        error: 'Failed to modify script due to an issue with the AI service response.',
      });
    } else if (errorMessageString.includes('Failed to get response from Gemini API')) {
      return res.status(502).json({
        error: 'Failed to get response from the AI service for script modification.',
      });
    }

    const displayError = errorMessageString
      ? `Failed to modify script: ${errorMessageString}`
      : 'Failed to modify script due to an internal server error.';
    res.status(500).json({ success: false, message: displayError });
  }
};

const handleUpdateScriptContent = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Script ID is required in URL parameters.' });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid request body: content must be a string.' });
  }

  try {
    const updatedScript = await scriptPersistenceService.updateScriptContent(id, content);
    res.status(200).json({ success: true, data: updatedScript });
  } catch (error) {
    logger.error(`[ScriptController] Error updating script with ID ${id}:`, error);
    const statusCode = error.status || 500;
    const message = error.message || 'An unexpected error occurred while updating the script.';
    res.status(statusCode).json({ success: false, message });
  }
};

module.exports = {
  handleGenerateScript,
  handleGetAllScripts,
  handleGetScriptById,
  handleModifyScript,
  handleUpdateScriptContent,
  handleRecordEngagement,
};
