// G.O.A.T. C.O.D.E.X. B.O.T. - Migrated and Enhanced ScriptGenerationService
// 'Durable', 'Optimized', and 'Xtensible' TypeScript implementation.

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, SafetySetting } from '@google/generative-ai';
import { YouTubeKeywordItem } from './trendDiscoveryService';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | undefined;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
  console.error('ScriptGenerationService: GEMINI_API_KEY is not set. Script generation will be disabled.');
}

const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }) : null;

const generationConfig: GenerationConfig = {
  temperature: 0.5, // Slightly more creative for script writing
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * 'Omniscient' AI-powered script generation based on a topic and trending keywords.
 * @param topic The main topic for the script.
 * @param trends An array of trend objects, containing keywords and other metrics.
 * @returns A promise that resolves to the generated script text.
 */
export const generateScript = async (topic: string, trends: YouTubeKeywordItem[]): Promise<string> => {
  if (!model) {
    throw new Error('ScriptGenerationService: Gemini model not initialized. Check GEMINI_API_KEY.');
  }

  let keywordDetails: string;
  if (trends && trends.length > 0) {
    const keywordList = trends.map(trend => `"${trend.keyword}"`).join(', ');
    keywordDetails = `Incorporate the following current trending keywords seamlessly and naturally into the script:\n${keywordList}`;
  } else {
    keywordDetails = 'No specific trending keywords were provided. Generate a general, engaging script about the topic based on your own knowledge.';
  }

  const prompt = `
Generate a concise and engaging video script (approximately 1-2 minutes, suitable for a platform like Synthesia) about "${topic}".

${keywordDetails}

The script should be informative, engaging, and suitable for a general audience. Focus on clarity and a positive or insightful tone.
Provide only the script content itself, without any surrounding text, titles, or introductions like "Here's the script:".
Do not use markdown formatting in the script output (e.g., no ### or **).
Ensure the script flows naturally and is ready for text-to-speech conversion.
Example of desired output format for a script with keywords:
"Welcome back to our channel! Today, we're diving deep into ${topic}. Did you know that ${trends && trends.length > 0 ? `the keyword '${trends[0].keyword}'` : 'a recent development'} is making waves? Let's explore..."
`;

  try {
    console.info(`[ScriptGenerationService] Generating script for topic: "${topic}"`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const responseText = result.response.text();

    if (typeof responseText !== 'string' || responseText.trim() === '') {
      throw new Error('Failed to get valid script content from Gemini API response (empty or invalid).');
    }
    
    console.info(`[ScriptGenerationService] Successfully generated script for topic: "${topic}"`);
    return responseText.trim();
  } catch (error: unknown) {
    console.error(`[ScriptGenerationService] Error generating script for topic "${topic}":`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini API Error: ${errorMessage}`);
  }
}
