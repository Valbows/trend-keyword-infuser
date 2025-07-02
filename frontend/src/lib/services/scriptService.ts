// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Xtensible' Script Data Service
// This service provides a centralized, 'Optimized' interface for all script-related database operations.

import { supabase } from './supabaseClient';

// 'Elegant' and 'Xtensible' type definition for a Script
// 'Elegant' and 'Xtensible' type definition for a Script, including engagement metrics
export interface Script {
  id: number;
  title: string;
  content: string;
  topic: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
  // Optional fields for YouTube engagement metrics
  published_video_id?: string;
  engagement_rate?: number;
  views?: number;
  likes?: number;
  comments?: number;
  engagement_retrieved_at?: string;
}

class ScriptService {
  /**
   * Retrieves all scripts from the database.
   * @returns A promise that resolves to an array of scripts.
   */
  async getAllScripts(): Promise<Script[]> {
    console.info('[ScriptService] Fetching all scripts.');
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ScriptService] Error fetching scripts:', error);
      throw new Error('Could not fetch scripts from the database.');
    }

    console.info(
      `[ScriptService] Successfully fetched ${data.length} scripts.`
    );
    return data;
  }

  /**
   * Retrieves a single script by its ID.
   * @param id The ID of the script to retrieve.
   * @returns A promise that resolves to the script object or null if not found.
   */
  async getScriptById(id: number): Promise<Script | null> {
    console.info(`[ScriptService] Fetching script with ID: ${id}.`);
    const { data, error } = await supabase
      .from('scripts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // PostgREST error for "exact one row not found"
        console.warn(`[ScriptService] Script with ID ${id} not found.`);
        return null;
      }
      console.error(`[ScriptService] Error fetching script ${id}:`, error);
      throw new Error(`Could not fetch script with ID ${id}.`);
    }

    console.info(`[ScriptService] Successfully fetched script with ID: ${id}.`);
    return data;
  }

  /**
   * Creates a new script in the database.
   * @param scriptData The data for the new script.
   * @returns A promise that resolves to the newly created script.
   */
  async createScript(
    scriptData: Omit<Script, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Script> {
    console.info(
      `[ScriptService] Creating new script with title: "${scriptData.title}".`
    );
    const { data, error } = await supabase
      .from('scripts')
      .insert([scriptData])
      .select()
      .single();

    if (error) {
      console.error('[ScriptService] Error creating script:', error);
      throw new Error('Could not create the new script.');
    }

    console.info(
      `[ScriptService] Successfully created script with ID: ${data.id}.`
    );
    return data;
  }

  /**
   * Updates an existing script in the database.
   * @param id The ID of the script to update.
   * @param updates The partial data to update the script with.
   * @returns A promise that resolves to the updated script.
   */
  async updateScript(
    id: number,
    updates: Partial<Omit<Script, 'id' | 'created_at'>>
  ): Promise<Script> {
    console.info(`[ScriptService] Updating script with ID: ${id}.`);
    const { data, error } = await supabase
      .from('scripts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[ScriptService] Error updating script ${id}:`, error);
      throw new Error(`Could not update script with ID ${id}.`);
    }

    console.info(`[ScriptService] Successfully updated script with ID: ${id}.`);
    return data;
  }
}

export const scriptService = new ScriptService();
