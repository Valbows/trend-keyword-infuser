// backend/src/services/scriptOrchestrationService.js

const llmService = require('./scriptGenerationService');
const trendDiscoveryService = require('./trendDiscoveryService');
const scriptPersistenceService = require('./scriptPersistenceService');
const cache = require('./cacheService');
const logger = require('../utils/logger');

class ScriptOrchestrationService {
  /**
   * Orchestrates the entire process of creating a video script, including caching and persistence.
   * This method is 'Clairvoyant', anticipating the need for caching and 'Durable' persistence.
   * @param {string} topic - The main topic for the script.
   * @param {Array<Object>} trends - An array of trend objects.
   * @returns {Promise<Object>} An object containing the generated script and its ID.
   */
  async orchestrateScriptCreation(topic, trends) {
    const validatedTrends = Array.isArray(trends) ? trends : [];
    const cacheKey = `script-generation:${topic}:${JSON.stringify(validatedTrends.sort())}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      logger.info(`[OrchestrationService] Serving generated script from cache for key: ${cacheKey}`);
      return cachedData;
    }

    logger.info(`[OrchestrationService] Starting fresh script creation for topic: "${topic}"`);

    // Step 1: LLM Script Generation
    const scriptText = await llmService.generateScript(topic, validatedTrends);

    // Step 2: Persist the script using our 'Durable' persistence service
    const savedScript = await scriptPersistenceService.createScript({
      topic: topic,
      trends_used: validatedTrends,
      generated_script: scriptText,
    });

    const responseData = {
      scriptId: savedScript.id,
      script: scriptText,
      topic: topic,
    };

    // Step 3: Cache the 'Truth-Seeking' result
    cache.set(cacheKey, responseData, 3600000); // Cache for 1 hour
    logger.info(`[OrchestrationService] Caching new script data for key: ${cacheKey}`);

    return responseData;
  }

  /**
   * Orchestrates the modification of an existing script and persists it.
   * This method is 'Optimized' to use the persistence layer for 'Durable' storage.
   * @param {string} existingScript - The script content to be modified.
   * @param {Array<string>} selectedKeywords - An array of keywords to infuse into the script.
   * @param {string|null} userId - The ID of the user performing the modification.
   * @returns {Promise<Object>} An object containing the modified script text and its new ID.
   */
  async orchestrateScriptModification(
    existingScript,
    selectedKeywords,
    userId = null
  ) {
    logger.info(`[OrchestrationService] Starting script modification with ${selectedKeywords.length} keywords.`);

    const instructionalTopic = `Please modify the following script by naturally and coherently infusing the provided keywords. 
Maintain the original tone and intent of the script as much as possible. Focus on enhancing the script with these keywords, not rewriting it entirely.

Keywords to infuse: ${selectedKeywords.join(', ')}

Existing Script to Modify:
---
${existingScript}
---

Return only the modified script content.`;

    logger.info('[OrchestrationService] Invoking LLM service for script modification...');
    const modifiedScriptText = await llmService.generateScript(
      instructionalTopic,
      selectedKeywords.map((kw) => ({ keyword: kw, source: 'user-selected' }))
    );
    logger.info('[OrchestrationService] Script successfully modified by LLM service.');

    // Save the modified script using the 'Durable' persistence service
    const scriptDataToSave = {
      generated_script: modifiedScriptText,
      topic: `Modified: ${existingScript.substring(0, 75)}...`,
      trends_used: selectedKeywords.map((keyword) => ({
        keyword,
        source: 'user_input_for_modification',
      })),
      user_id: userId,
    };

    const savedScript = await scriptPersistenceService.createScript(scriptDataToSave);

    logger.info(`[OrchestrationService] Modified script saved with ID: ${savedScript.id}`);
    
    return { modifiedScriptText, savedScriptId: savedScript.id };
  }
}

module.exports = new ScriptOrchestrationService();
