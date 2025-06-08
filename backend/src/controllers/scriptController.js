const scriptOrchestrationService = require('../services/scriptOrchestrationService');
const supabase = require('../config/supabaseClient'); // Import Supabase client

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

  // Trends can be optional or an empty array if the user only provides a topic
  // The scriptGenerationService is designed to handle empty trends.
  const validatedTrends = Array.isArray(trends) ? trends : [];

  try {
    console.log(`Controller: Received request to generate script for topic: ${topic}`);
    const scriptText = await scriptOrchestrationService.orchestrateScriptCreation(topic, validatedTrends);

    // Save the generated script to Supabase
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('scripts')
        .insert([
          { 
            topic: topic,
            trends_used: validatedTrends, // Assuming validatedTrends is an array of strings
            generated_script: scriptText
          }
        ])
        .select(); // Optionally .select() to get the inserted row back

      if (dbError) {
        console.error('Error saving script to Supabase:', dbError);
        // Decide if this should be a fatal error for the client, or just log and proceed
        // For now, we'll log it and still return the script if generation was successful.
        // You might want to return a 500 error or a partial success message in a real app.
      } else {
        console.log('Script saved to Supabase:', dbData ? dbData[0].id : 'ID not returned by select');
      }
    } catch (e) {
      console.error('Unexpected error during Supabase insert:', e);
    }

    res.status(200).json({ script: scriptText });
  } catch (error) {
    console.error('Error in scriptController handling script generation:', error.message);
    if (error.message.includes('GEMINI_API_KEY is not set')) {
      return res.status(500).json({ error: 'Script generation service is not configured.' });
    } else if (error.message.includes('Failed to get valid script content')) {
      return res.status(502).json({ error: 'Failed to generate script due to an issue with the AI service response.' });
    }
    // Generic error for other cases from the service or unexpected issues
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
    console.log(`Controller: Received request to modify script with ${selectedKeywords.length} keywords.`);
    const modifiedScriptText = await scriptOrchestrationService.orchestrateScriptModification(existingScript, selectedKeywords);

    // Optionally, save the modified script or log its modification. For now, just returning.
    // Consider if modified scripts should also be saved to Supabase or a different table.

    res.status(200).json({
      modifiedScript: modifiedScriptText,
      originalScript: existingScript,
      keywordsUsed: selectedKeywords,
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

module.exports = {
  handleGenerateScript,
  handleGetAllScripts,
  handleGetScriptById,
  handleModifyScript,
};
