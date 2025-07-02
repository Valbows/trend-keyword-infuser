// G.O.A.T. C.O.D.E.X. B.O.T. - Migrated and Enhanced KeywordAnalysisService
// 'Durable', 'Optimized', and 'Xtensible' TypeScript implementation.

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerationConfig, SafetySetting } from '@google/generative-ai';

// 'Elegant' and 'Xtensible' type definitions
export interface AIRelevance {
  score: number;
  justification: string;
  error?: string;
}

// Base type for keyword objects
export interface KeywordInput {
  keyword: string;
  [key: string]: any; // Allow other properties
}

// 'Durable' generic type for keyword objects after AI analysis, using a type intersection.
export type KeywordWithRelevance<T extends KeywordInput> = T & {
  aiRelevance: AIRelevance | null;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | undefined;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
  console.error('KeywordAnalysisService: GEMINI_API_KEY is not set. AI relevance features will be disabled.');
}

const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }) : null;

const generationConfig: GenerationConfig = {
  temperature: 0.3,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
  responseMimeType: 'application/json',
};

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * 'Omniscient' AI-powered relevance analysis for keywords against a context topic.
 * @param keywordsArray - Array of keyword objects to analyze.
 * @param contextTopic - The topic to evaluate keyword relevance against.
 * @returns The original keywords array, augmented with 'aiRelevance' data.
 */
export async function getRelevanceForKeywords<T extends KeywordInput>(
  keywordsArray: T[],
  contextTopic: string
): Promise<KeywordWithRelevance<T>[]> {
  if (!model) {
    console.warn('KeywordAnalysisService: Gemini model not initialized. Skipping AI relevance.');
    return keywordsArray.map((kw) => ({ ...kw, aiRelevance: null }));
  }
  if (!keywordsArray || keywordsArray.length === 0) {
    return [];
  }
  if (!contextTopic || typeof contextTopic !== 'string' || contextTopic.trim() === '') {
    console.warn('KeywordAnalysisService: Context topic is invalid. Skipping AI relevance.');
    return keywordsArray.map((kw) => ({ ...kw, aiRelevance: null }));
  }

  const keywordStringsForPrompt = keywordsArray.map((kw) => kw.keyword);

  const prompt = `
    You are an expert SEO and content strategist. Your task is to evaluate a list of YouTube keywords based on their relevance to a given primary context topic.
    Primary Context Topic: "${contextTopic}"
    YouTube Keywords List: ${JSON.stringify(keywordStringsForPrompt)}
    For each keyword, provide a relevance score (1-5) and a brief justification (10-15 words).
    Return your analysis as a VALID JSON array of objects, each with "keyword", "relevance_score", and "justification" properties.
    The output must ONLY be the JSON array.
  `;

  try {
    console.debug(`KeywordAnalysisService: Sending prompt to Gemini for topic "${contextTopic}".`);
    const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig, safetySettings });

    const responseText = result.response.text();
    const aiResults: { keyword: string; relevance_score: number; justification: string }[] = JSON.parse(responseText);

    const aiResultsMap = new Map<string, Omit<AIRelevance, 'error'>>();
    aiResults.forEach((res) => {
      if (res && res.keyword && typeof res.relevance_score === 'number') {
        aiResultsMap.set(res.keyword, { score: res.relevance_score, justification: res.justification });
      }
    });

    const augmentedKeywords: KeywordWithRelevance<T>[] = keywordsArray.map((originalKeywordObj) => {
      const aiData = aiResultsMap.get(originalKeywordObj.keyword);
      return {
        ...originalKeywordObj,
        aiRelevance: aiData ? { ...aiData } : { score: 0, justification: 'Keyword not found in AI results.', error: 'Analysis failed for this keyword.' },
      };
    });

    console.info(`KeywordAnalysisService: Successfully processed AI relevance for ${keywordsArray.length} keywords.`);
    return augmentedKeywords;

  } catch (error: any) {
    console.error('KeywordAnalysisService: Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return keywordsArray.map((kw) => ({ ...kw, aiRelevance: { score: 0, justification: '', error: `AI API call failed: ${errorMessage}` } }));
  }
}
