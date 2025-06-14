// backend/src/services/ScriptService.js
const crypto = require('crypto');

// In-memory store for scripts
const scripts = new Map();

/**
 * @typedef {Object} Trend
 * @property {string} keyword
 * @property {string} [snippet]
 * @property {string} source
 * @property {string} pubDate // ISO Date String
 */

/**
 * @typedef {Object} Script
 * @property {string} id - Unique identifier for the script
 * @property {string} topic - The main topic of the script
 * @property {Array<Trend>} trends - The trends used to generate the script
 * @property {string} content - The actual script content
 * @property {string} createdAt - ISO date string of creation time
 * @property {string} updatedAt - ISO date string of last update time
 */

/**
 * Creates a new script and stores it.
 * @param {string} topic - The main topic for the script.
 * @param {Array<Trend>} trends - An array of trend objects.
 * @param {string} content - The generated script content.
 * @returns {Script} The newly created script object.
 */
const createScript = (topic, trends, content) => {
  if (!topic || typeof topic !== 'string' || topic.trim() === '') {
    throw new Error('Topic is required and must be a non-empty string.');
  }
  if (!content || typeof content !== 'string' || content.trim() === '') {
    throw new Error(
      'Script content is required and must be a non-empty string.'
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const newScript = {
    id,
    topic,
    trends: Array.isArray(trends) ? trends : [], // Ensure trends is an array
    content,
    createdAt: now,
    updatedAt: now,
  };
  scripts.set(id, newScript);
  console.log(`Script created with ID: ${id}, Topic: ${topic}`);
  return newScript;
};

/**
 * Retrieves a script by its ID.
 * @param {string} scriptId - The ID of the script to retrieve.
 * @returns {Script | undefined} The script object if found, otherwise undefined.
 */
const getScriptById = (scriptId) => {
  if (!scriptId) {
    console.warn('getScriptById called with no scriptId');
    return undefined;
  }
  return scripts.get(scriptId);
};

/**
 * Updates the content of an existing script.
 * @param {string} scriptId - The ID of the script to update.
 * @param {string} newContent - The new content for the script.
 * @returns {Script | null} The updated script object, or null if the script was not found.
 * @throws {Error} if newContent is invalid.
 */
const updateScriptContent = (scriptId, newContent) => {
  if (!scriptId) {
    console.warn('updateScriptContent called with no scriptId');
    return null;
  }
  if (
    newContent === undefined ||
    newContent === null ||
    typeof newContent !== 'string'
  ) {
    // Allow empty string for content, but not undefined/null or wrong type
    throw new Error('New content must be a string.');
  }

  const script = scripts.get(scriptId);
  if (!script) {
    console.warn(`Script with ID: ${scriptId} not found for update.`);
    return null;
  }

  script.content = newContent;
  script.updatedAt = new Date().toISOString();
  scripts.set(scriptId, script); // Re-set to ensure map is updated if script was a copy (though it's by reference here)
  console.log(`Script content updated for ID: ${scriptId}`);
  return script;
};

/**
 * Retrieves all scripts from the store.
 * @returns {Array<Script>} An array of all script objects.
 */
const getAllScripts = () => {
  return Array.from(scripts.values());
};

module.exports = {
  createScript,
  getScriptById,
  updateScriptContent,
  getAllScripts,
  // For testing/clearing purposes if needed, not typically for production use by other services
  _clearAllScripts_TEST_ONLY: () => scripts.clear(),
  _getScriptsMap_TEST_ONLY: () => scripts,
};
