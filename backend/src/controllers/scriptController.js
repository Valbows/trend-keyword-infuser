const engagementRecordingService = require('../services/engagementRecordingService');
const scriptOrchestrationService = require('../services/scriptOrchestrationService');
const supabase = require('../config/supabaseClient');
const cache = require('../services/cacheService');
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
    return res.status(400).json({ error: 'Missing required field: topic' });
  }

  const validatedTrends = Array.isArray(trends) ? trends : [];

  const cacheKey = `script-generation:${topic}:${JSON.stringify(validatedTrends.sort())}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const scriptText =
      await scriptOrchestrationService.orchestrateScriptCreation(
        topic,
        validatedTrends
      );

    let scriptId = null;
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('scripts')
        .insert([
          {
            topic: topic,
            trends_used: validatedTrends,
            generated_script: scriptText,
          },
        ])
        .select();

      if (dbError) {
        logger.error('Error saving script to Supabase:', dbError);
      } else if (dbData && dbData.length > 0 && dbData[0].id) {
        scriptId = dbData[0].id;
      } else {
        logger.error('Failed to retrieve script ID from Supabase after insert, or dbData is unexpected:', dbData);
      }
    } catch (e) {
      logger.error('Unexpected error during Supabase insert:', e);
    }

    const responseData = {
      scriptId: scriptId,
      script: scriptText,
      topic: topic,
    };

    cache.set(cacheKey, responseData, 3600000);

    res.status(200).json(responseData);
  } catch (error) {
    logger.error('Error in scriptController handling script generation:', error.message);
    if (error.message.includes('GEMINI_API_KEY is not set')) {
      return res
        .status(500)
        .json({ error: 'Script generation service is not configured.' });
    } else if (error.message.includes('Failed to get valid script content')) {
      return res.status(502).json({
        error:
          'Failed to generate script due to an issue with the AI service response.',
      });
    }
    res.status(500).json({
      error: 'Failed to generate script due to an internal server error.',
    });
  }
};

const handleGetAllScripts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching all scripts:', error);
      return res.status(500).json({ error: 'Failed to retrieve scripts.' });
    }

    res.status(200).json(data);
  } catch (e) {
    logger.error('Unexpected error in handleGetAllScripts:', e);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

const handleGetScriptById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error(`Error fetching script with ID ${id}:`, error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Script not found.' });
      }
      return res.status(500).json({ error: 'Failed to retrieve script.' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Script not found.' });
    }

    res.status(200).json(data);
  } catch (e) {
    logger.error('Unexpected error in handleGetScriptById:', e);
    res.status(500).json({ error: 'An unexpected error occurred.' });
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
      message: 'Script modified and saved successfully.',
      modifiedScript: modifiedScriptText,
      originalScript: existingScript,
      keywordsUsed: selectedKeywords,
      savedScriptId: savedScriptId,
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
    res.status(500).json({ error: displayError });
  }
};

const handleUpdateScriptContent = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Script ID is required in URL parameters.' });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid request body: content must be a string.' });
  }

  try {
    const { data, error } = await supabase
      .from('scripts')
      .update({
        generated_script: content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) {
      logger.error(`Error updating script with ID ${id}:`, error);
      return res.status(500).json({ error: 'Failed to update script due to a database error.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Script not found or no changes made.' });
    }

    res.status(200).json(data[0]);
  } catch (e) {
    logger.error('Unexpected error in handleUpdateScriptContent:', e);
    res.status(500).json({
      error: 'An unexpected error occurred while updating the script.',
    });
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
