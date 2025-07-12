// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable', 'Xtensible', and 'Tactical' Script Data Service
// This service provides a centralized, 'Optimized' interface for all script-related database operations.
// Enhanced with robust error handling and standardized service responses.

import { supabaseAdmin as supabase } from './supabaseClient';
import { ServiceResponse, withErrorHandling } from '../utils/serviceUtils';
import { YouTubeKeywordTrend } from './trendDiscoveryService';

// 'Elegant' and 'Xtensible' type definition for a Script
// 'Elegant' and 'Xtensible' type definition for a Script, including engagement metrics
export interface Script {
  id: string; // Changed from number to string for UUID
  topic: string;
  trends_used: YouTubeKeywordTrend[]; // Changed from keywords: string[] to trends_used: any for jsonb type
  generated_script: string; // Changed from script_text
  user_id: string | null;
  created_at: string;
  updated_at: string;

  // Engagement Metrics
  published_video_id?: string | null;
  engagement_rate?: number | null;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  engagement_retrieved_at?: string | null;
}

class ScriptService {
  /**
   * Retrieves all scripts from the database with standardized error handling.
   * @returns A promise that resolves to a ServiceResponse containing an array of scripts.
   */
  async getAllScripts(): Promise<ServiceResponse<Script[]>> {
    return await withErrorHandling<Script[]>('getAllScripts', async () => {
      console.info('[ScriptService] Fetching all scripts.');

      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ScriptService] Error fetching scripts:', error);
        throw error; // Will be caught by withErrorHandling
      }

      console.info(
        `[ScriptService] Successfully fetched ${data.length} scripts.`
      );

      return data as Script[];
    });
  }

  /**
   * Retrieves a single script by its ID.
   * @param id The ID of the script to retrieve.
   * @returns A promise that resolves to the script object or null if not found.
   */
  async getScriptById(id: string): Promise<Script | null> {
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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'Not Found';
    const keySnippet =
      serviceKey === 'Not Found'
        ? 'Not Found'
        : `${serviceKey.substring(0, 5)}...${serviceKey.substring(serviceKey.length - 5)}`;
    console.info(
      `[ScriptService] Using Service Role Key starting with: ${keySnippet}`
    );
    console.info(
      `[ScriptService] Creating new script with topic: "${scriptData.topic}".`
    );

    const { data, error } = await supabase
      .from('scripts')
      .insert([scriptData])
      .select()
      .single();

    if (error) {
      console.error('Error creating script:', error);
      // Throw the specific error message from Supabase for better debugging.
      throw new Error(`Failed to create script: ${error.message}`);
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
    id: string,
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
