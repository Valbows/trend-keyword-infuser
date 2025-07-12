// G.O.A.T. C.O.D.E.X. B.O.T. - Migrated and Enhanced ScriptOrchestrationService
// 'Durable', 'Optimized', and 'Xtensible' TypeScript implementation for a serverless environment.

import { generateScript } from './scriptGenerationService';
import { scriptService, Script } from './scriptService';
import { YouTubeKeywordTrend } from './trendDiscoveryService';

class ScriptOrchestrationService {
  /**
   * 'Clairvoyant' orchestration of the entire script creation process.
   * @param topic The main topic for the script.
   * @param trends An array of trend objects.
   * @returns A promise that resolves to the newly created script object.
   */
  async orchestrateScriptCreation(
    topic: string,
    trends: YouTubeKeywordTrend[]
  ): Promise<Script> {
    console.info(
      `[OrchestrationService] Starting script creation for topic: "${topic}"`
    );

    // Step 1: LLM Script Generation
    let scriptText: string;
    try {
      scriptText = await generateScript(topic, trends);
      console.info(`[OrchestrationService] Script generation successful.`);
    } catch (error) {
      console.error(`[OrchestrationService] Script generation failed:`, error);
      throw error; // Re-throw to be caught by the API route handler
    }

    // Step 2: Persist the script using our 'Durable' script service
    let savedScript: Script;
    try {
      savedScript = await scriptService.createScript({
        topic: topic,
        trends_used: trends, // Pass the full trend objects
        generated_script: scriptText,
        user_id: null, // Add null user_id to satisfy the interface
      });
      console.info(
        `[OrchestrationService] Script saved to database with ID: ${savedScript.id}`
      );
    } catch (error) {
      console.error(
        `[OrchestrationService] Failed to save script to database:`,
        error
      );
      throw error; // Re-throw to be caught by the API route handler
    }

    return savedScript;
  }
}

export const scriptOrchestrationService = new ScriptOrchestrationService();
