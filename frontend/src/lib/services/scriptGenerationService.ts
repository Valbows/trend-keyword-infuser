// G.O.A.T. C.O.D.E.X. B.O.T. - Migrated and Enhanced ScriptGenerationService
// 'Durable', 'Optimized', and 'Xtensible' TypeScript implementation.

import {
  geminiClient,
  HarmCategory,
  HarmBlockThreshold,
  GenerateContentRequest,
} from './geminiClientWrapper';
import NodeCache from 'node-cache';
import { GenerationConfig, SafetySetting } from '@google/generative-ai';
import { YouTubeKeywordTrend } from './trendDiscoveryService';

// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' Caching Layer for Scripts
const scriptCache = new NodeCache({ stdTTL: 1800 }); // Cache scripts for 30 minutes

const generationConfig: GenerationConfig = {
  temperature: 0.5, // Slightly more creative for script writing
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * 'Omniscient' AI-powered script generation based on a topic and trending keywords.
 * @param topic The main topic for the script.
 * @param trends An array of trend objects, containing keywords and other metrics.
 * @returns A promise that resolves to the generated script text.
 */
export const infuseKeywordsIntoScript = async (
  existingContent: string,
  keywords: string[]
): Promise<string> => {
  if (!geminiClient) {
    throw new Error('ScriptGenerationService: Gemini client not initialized.');
  }

  console.log(
    `[ScriptGenerationService] Infusing keywords into existing script.`
  );

  let keywordDetails: string;
  if (keywords && keywords.length > 0) {
    const keywordList = keywords.map((keyword) => `"${keyword}"`).join(', ');
    keywordDetails = `Seamlessly and naturally integrate the following keywords into the script: ${keywordList}.`;
  } else {
    // If no keywords are provided, we can just return the original content
    // as there is nothing to infuse.
    console.log(
      '[ScriptGenerationService] No keywords provided for infusion, returning original content.'
    );
    return existingContent;
  }

  const prompt = `
Rewrite the following video script to incorporate the specified keywords. The core message and tone of the original script should be preserved.

**Original Script:**
"${existingContent}"

**Keywords to integrate:**
${keywordDetails}

**Instructions:**
- The final output should be only the modified script text.
- Do not add any extra titles, introductions, or conversational text like "Here is the rewritten script:".
- Do not use markdown formatting (e.g., no ### or **).
- Ensure the script flows naturally and is ready for text-to-speech conversion.
`;

  try {
    console.info(`[ScriptGenerationService] Infusing keywords into script.`);

    const request: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    };

    const result = await geminiClient.generateContent(request);
    const response = result.response;
    const modifiedScript = response.text();

    console.info(`[ScriptGenerationService] Keyword infusion successful.`);
    return modifiedScript;
  } catch (error) {
    console.error(
      '[ScriptGenerationService] Error during keyword infusion:',
      error
    );
    throw new Error(
      'Failed to infuse keywords into the script via AI service.'
    );
  }
};

/**
 * 'Omniscient' AI-powered script generation based on a topic and trending keywords.
 * @param topic The main topic for the script.
 * @param trends An array of trend objects, containing keywords and other metrics.
 * @returns A promise that resolves to the generated script text.
 */
export const generateScript = async (
  topic: string,
  trends: YouTubeKeywordTrend[]
): Promise<string> => {
  if (!geminiClient) {
    throw new Error('ScriptGenerationService: Gemini client not initialized.');
  }

  // G.O.A.T. C.O.D.E.X. B.O.T. - Cache key generation
  const sortedKeywords = trends
    .map((t) => t.keyword)
    .sort()
    .join(',');
  const cacheKey = `script:${topic}:${sortedKeywords}`;
  const cachedScript = scriptCache.get<string>(cacheKey);

  if (cachedScript) {
    console.log(
      `[ScriptGenerationService] Returning cached script for key: ${cacheKey}`
    );
    return cachedScript;
  }

  console.log(
    `[ScriptGenerationService] No cache hit for key: ${cacheKey}. Generating fresh script.`
  );

  let keywordDetails: string;
  if (trends && trends.length > 0) {
    const keywordList = trends
      .map((trend) => `\"${trend.keyword}\"`)
      .join(', ');
    keywordDetails = `Incorporate the following current trending keywords seamlessly and naturally into the script:\n${keywordList}`;
  } else {
    keywordDetails =
      'No specific trending keywords were provided. Generate a general, engaging script about the topic based on your own knowledge.';
  }

  const prompt = `
Generate a concise and engaging video script (approximately 1-2 minutes, suitable for a platform like Synthesia) about \"${topic}\".

${keywordDetails}

The script should be informative, engaging, and suitable for a general audience. Focus on clarity and a positive or insightful tone.
Provide only the script content itself, without any surrounding text, titles, or introductions like \"Here's the script:\".
Do not use markdown formatting in the script output (e.g., no ### or **).
Ensure the script flows naturally and is ready for text-to-speech conversion.
Example of desired output format for a script with keywords:
\"Welcome back to our channel! Today, we're diving deep into ${topic}. Did you know that ${trends && trends.length > 0 ? `the keyword '${trends[0].keyword}'` : 'a recent development'} is making waves? Let's explore...\"
`;

  try {
    console.info(
      `[ScriptGenerationService] Generating script for topic: "${topic}"`
    );

    const request: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    };

    const result = await geminiClient.generateContent(request);
    const scriptText = result.response.text();

    if (!scriptText) {
      throw new Error(
        'ScriptGenerationService: AI failed to generate a script. The response was empty.'
      );
    }

    // G.O.A.T. C.O.D.E.X. B.O.T. - Store fresh script in cache
    scriptCache.set(cacheKey, scriptText);
    console.log(
      `[ScriptGenerationService] Stored fresh script in cache for key: ${cacheKey}`
    );

    return scriptText;
  } catch (error: unknown) {
    console.error(
      `[ScriptGenerationService] Failed to generate script for topic: "${topic}"`,
      error
    );
    // G.O.A.T. C.O.D.E.X. B.O.T. - Always propagate errors for the API route to handle.
    // This ensures that transient issues like quota errors don't result in failed data persistence attempts.
    if (error instanceof Error) {
      throw new Error(`Script generation failed: ${error.message}`);
    }
    throw new Error(`Script generation failed due to an unknown error.`);
  }
};
