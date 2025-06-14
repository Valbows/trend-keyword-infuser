const scriptOrchestrationService = require('../services/scriptOrchestrationService');
const supabase = require('../config/supabaseClient'); // Import Supabase client
const cache = require('../services/cacheService');

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
  
  // Create a stable cache key by sorting the trends array before stringifying.
  const cacheKey = `script-generation:${topic}:${JSON.stringify(validatedTrends.sort())}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    console.log(`[scriptController.handleGenerateScript] Serving from cache for key: ${cacheKey}`);
    return res.status(200).json(cachedData);
  }

  try {
    console.log(`Controller: Received request to generate script for topic: ${topic}`);
    const scriptText = await scriptOrchestrationService.orchestrateScriptCreation(topic, validatedTrends);

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
        console.error('Error saving script to Supabase:', dbError);
      } else if (dbData && dbData.length > 0 && dbData[0].id) {
        scriptId = dbData[0].id;
        console.log(`Script ID ${scriptId} successfully retrieved for response.`);
      } else {
        console.error('Failed to retrieve script ID from Supabase after insert, or dbData is unexpected:', dbData);
      }
    } catch (e) {
      console.error('Unexpected error during Supabase insert:', e);
    }

    const responseData = { scriptId: scriptId, script: scriptText, topic: topic };
    
    // Cache for 1 hour
    cache.set(cacheKey, responseData, 3600000);
    console.log(`[scriptController.handleGenerateScript] Caching new data for key: ${cacheKey}`);

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in scriptController handling script generation:', error.message);
    if (error.message.includes('GEMINI_API_KEY is not set')) {
      return res.status(500).json({ error: 'Script generation service is not configured.' });
    } else if (error.message.includes('Failed to get valid script content')) {
      return res.status(502).json({ error: 'Failed to generate script due to an issue with the AI service response.' });
    }
    res.status(500).json({ error: 'Failed to generate script due to an internal server error.' });
  }
};

const handleGetAllScripts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('created_at', { ascending: false }); // Fetch newest first

    if (error) {
      console.error('Error fetching all scripts:', error);
      return res.status(500).json({ error: 'Failed to retrieve scripts.' });
    }

    res.status(200).json(data);
  } catch (e) {
    console.error('Unexpected error in handleGetAllScripts:', e);
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
      .single(); // .single() expects exactly one row or returns an error

    if (error) {
      console.error(`Error fetching script with ID ${id}:`, error);
      // Supabase error for .single() if no rows found is P0002, or if multiple rows (shouldn't happen with PK)
      if (error.code === 'PGRST116') { // PGRST116 is the code for .single() finding no rows
        return res.status(404).json({ error: 'Script not found.' });
      }
      return res.status(500).json({ error: 'Failed to retrieve script.' });
    }

    if (!data) { // Should be caught by error.code PGRST116, but as a fallback
      return res.status(404).json({ error: 'Script not found.' });
    }

    res.status(200).json(data);
  } catch (e) {
    console.error('Unexpected error in handleGetScriptById:', e);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

/**
 * Handles the request to modify an existing script with selected keywords.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 */
const handleModifyScript = async (req, res) => {
  // G.O.A.T. C.O.D.E.X. B.O.T. - Extract userId, assuming auth middleware sets req.user
  const userId = req.user ? req.user.id : null; 
  // If req.user is not set, this will pass null. Adjust if auth works differently for this route.
  const { existingScript, selectedKeywords } = req.body;

  if (!existingScript || typeof existingScript !== 'string' || existingScript.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid required field: existingScript (must be a non-empty string).' });
  }

  if (!selectedKeywords || !Array.isArray(selectedKeywords) || selectedKeywords.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid required field: selectedKeywords (must be a non-empty array of strings).' });
  }
  if (selectedKeywords.some(kw => typeof kw !== 'string' || kw.trim() === '')) {
    return res.status(400).json({ error: 'Invalid field: selectedKeywords must be an array of non-empty strings.' });
  }

  try {
    console.log(`Controller: Received request to modify script with ${selectedKeywords.length} keywords for user ID: ${userId}.`);
    const { modifiedScriptText, savedScriptId } = await scriptOrchestrationService.orchestrateScriptModification(existingScript, selectedKeywords, userId);

    // Optionally, save the modified script or log its modification. For now, just returning.
    // Consider if modified scripts should also be saved to Supabase or a different table.

    res.status(200).json({
      message: 'Script modified and saved successfully.',
      modifiedScript: modifiedScriptText,
      originalScript: existingScript,
      keywordsUsed: selectedKeywords,
      savedScriptId: savedScriptId // G.O.A.T. C.O.D.E.X. B.O.T. - Include the ID of the saved script
    });
  } catch (error) {
    // Log the original error object for more detailed debugging if needed
    console.error('Raw error in scriptController handling script modification:', error);
    // Safely access error.message
    const errorMessageString = (error && typeof error.message === 'string') ? error.message : '';
    const errorStack = (error && typeof error.stack === 'string') ? error.stack : 'No stack available.';

    console.error(`Error in scriptController handling script modification (Processed): Message: "${errorMessageString}", Stack: ${errorStack}`);

    if (errorMessageString.includes('GEMINI_API_KEY is not set')) {
      return res.status(500).json({ error: 'Script modification service is not configured (API Key missing).' });
    } else if (errorMessageString.includes('Failed to get valid modified script content')) {
      return res.status(502).json({ error: 'Failed to modify script due to an issue with the AI service response.' });
    } else if (errorMessageString.includes('Failed to get response from Gemini API')) {
      return res.status(502).json({ error: 'Failed to get response from the AI service for script modification.' });
    }
    
    // Generic error for other cases
    const displayError = errorMessageString ? `Failed to modify script: ${errorMessageString}` : 'Failed to modify script due to an internal server error.';
    res.status(500).json({ error: displayError });
  }
};

const handleUpdateScriptContent = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Script ID is required in URL parameters.' });
  }

  // Content can be an empty string, but it must be a string.
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid request body: content must be a string.' });
  }

  try {
    const { data, error } = await supabase
      .from('scripts')
      .update({ 
        generated_script: content,
        updated_at: new Date().toISOString() // Explicitly set updated_at
      })
      .eq('id', id)
      .select(); // Fetch the updated record

    if (error) {
      console.error(`Error updating script with ID ${id}:`, error);
      // Check for specific Supabase errors if needed, e.g., foreign key violation, etc.
      return res.status(500).json({ error: 'Failed to update script due to a database error.' });
    }

    if (!data || data.length === 0) {
      // This means the .eq('id', id) condition did not find any matching row.
      return res.status(404).json({ error: 'Script not found or no changes made.' });
    }

    console.log(`Script with ID ${id} updated successfully.`);
    res.status(200).json(data[0]); // Return the updated script object

  } catch (e) {
    console.error('Unexpected error in handleUpdateScriptContent:', e);
    res.status(500).json({ error: 'An unexpected error occurred while updating the script.' });
  }
};

module.exports = {
  handleGenerateScript,
  handleGetAllScripts,
  handleGetScriptById,
  handleModifyScript,
  handleUpdateScriptContent,
};
