const supabase = require('../config/supabaseClient');
const logger = require('../utils/logger');

/**
 * A 'Durable' and 'Optimized' service for all database interactions with the 'scripts' table.
 * This service encapsulates all Supabase calls, ensuring a 'Clairvoyant' separation of concerns.
 */
class ScriptPersistenceService {
  /**
   * Creates a new script in the database.
   * @param {object} scriptDetails - The details of the script to create.
   * @returns {Promise<object>} The created script data, including its new ID.
   */
  async createScript({ topic, trends_used, generated_script }) {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .insert([{ topic, trends_used, generated_script }])
        .select();

      if (error) {
        logger.error('Error saving script to Supabase:', error);
        throw new Error('Failed to save script to the database.');
      }

      if (!data || data.length === 0) {
        logger.error('Failed to retrieve script ID from Supabase after insert.');
        throw new Error('Failed to confirm script creation in the database.');
      }

      return data[0];
    } catch (e) {
      logger.error('Unexpected error in createScript:', e);
      throw new Error('An unexpected error occurred while creating the script.');
    }
  }

  /**
   * Retrieves all scripts from the database.
   * @returns {Promise<Array<object>>} A list of all scripts.
   */
  async getAllScripts() {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching all scripts:', error);
      throw new Error('Failed to retrieve scripts.');
    }

    return data;
  }

  /**
   * Retrieves a single script by its ID.
   * @param {string} id - The ID of the script to retrieve.
   * @returns {Promise<object>} The script data.
   */
  async getScriptById(id) {
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error(`Error fetching script with ID ${id}:`, error);
      if (error.code === 'PGRST116') {
        const notFoundError = new Error('Script not found.');
        notFoundError.status = 404;
        throw notFoundError;
      }
      throw new Error('Failed to retrieve script.');
    }

    return data;
  }

  /**
   * Updates the content of a specific script.
   * @param {string} id - The ID of the script to update.
   * @param {string} content - The new content for the script.
   * @returns {Promise<object>} The updated script data.
   */
  async updateScriptContent(id, content) {
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
      throw new Error('Failed to update script due to a database error.');
    }

    if (!data || data.length === 0) {
      const notFoundError = new Error('Script not found or no changes made.');
      notFoundError.status = 404;
      throw notFoundError;
    }

    return data[0];
  }
}

module.exports = new ScriptPersistenceService();
