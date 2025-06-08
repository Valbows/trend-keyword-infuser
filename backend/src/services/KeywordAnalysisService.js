// backend/src/services/KeywordAnalysisService.js
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
  console.error('KeywordAnalysisService: GEMINI_API_KEY is not set. AI relevance features will be disabled.');
}

const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }) : null;

const generationConfig = {
  temperature: 0.3,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
  response_mime_type: 'application/json',
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Gets AI-powered relevance scores and justifications for a list of keywords against a context topic.
 * @param {Array<Object>} keywordsArray - Array of keyword objects (e.g., from TrendDiscoveryService, expected to have a 'keyword' string property).
 * @param {string} contextTopic - The topic to evaluate keyword relevance against.
 * @returns {Promise<Array<Object>>} The original keywords array, with an 'aiRelevance' object added to each.
 *                                    aiRelevance: { score: number, justification: string } or null if analysis failed.
 */
async function getRelevanceForKeywords(keywordsArray, contextTopic) {
  if (!model) {
    console.warn('KeywordAnalysisService.getRelevanceForKeywords: Gemini model not initialized (API Key likely missing). Skipping AI relevance.');
    return keywordsArray.map(kw => ({ ...kw, aiRelevance: null }));
  }
  if (!keywordsArray || keywordsArray.length === 0) {
    return [];
  }
  if (!contextTopic || typeof contextTopic !== 'string' || contextTopic.trim() === '') {
    console.warn('KeywordAnalysisService.getRelevanceForKeywords: Context topic is invalid. Skipping AI relevance.');
    return keywordsArray.map(kw => ({ ...kw, aiRelevance: null }));
  }

  const keywordStringsForPrompt = keywordsArray.map(kw => kw.keyword);

  const promptLines = [
    "You are an expert SEO and content strategist. Your task is to evaluate a list of YouTube keywords based on their relevance to a given primary context topic.",
    "",
    `Primary Context Topic: \"${contextTopic}\"`,
    "",
    "YouTube Keywords List:",
    JSON.stringify(keywordStringsForPrompt),
    "",
    "For each keyword in the list, provide a relevance score and a brief justification.",
    "The relevance score must be an integer between 1 (least relevant) and 5 (most relevant).",
    "The justification should be a concise explanation (around 10-15 words) for the assigned score.",
    "",
    "Return your analysis as a VALID JSON array of objects. Each object in the array must correspond to one of the input keywords (in the same order) and MUST have the following three properties ONLY:",
    "1. \"keyword\": The exact keyword string from the input list.",
    "2. \"relevance_score\": An integer from 1 to 5.",
    "3. \"justification\": A brief string explanation.",
    "",
    "Example for a single keyword if contextTopic was \"Sustainable Gardening\" and a keyword was \"DIY Compost Bin\":",
    "{",
    "  \"keyword\": \"DIY Compost Bin\",",
    "  \"relevance_score\": 5,",
    "  \"justification\": \"Directly supports sustainable gardening by promoting waste recycling and soil enrichment.\"",
    "}",
    "",
    "Ensure the output is ONLY the JSON array, with no other text, comments, or markdown formatting before or after it.",
    "The number of objects in your JSON array response MUST exactly match the number of keywords in the input list."
  ];
  const prompt = promptLines.join('\\n');

  try {
    console.debug(`KeywordAnalysisService: Sending prompt to Gemini for topic \"${contextTopic}\" and ${keywordsArray.length} keywords.`);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    if (!response || typeof response.text !== 'function') {
        console.error('KeywordAnalysisService: Invalid response structure from Gemini API.');
        return keywordsArray.map(kw => ({ ...kw, aiRelevance: { error: 'Invalid AI response structure' } }));
    }
    const responseText = response.text();
    
    let aiResults;
    try {
      aiResults = JSON.parse(responseText);
    } catch (parseError) {
      console.error('KeywordAnalysisService: Failed to parse JSON response from Gemini:', parseError);
      console.error('KeywordAnalysisService: Gemini raw response text:', responseText);
      return keywordsArray.map(kw => ({ ...kw, aiRelevance: { error: 'Failed to parse AI response' } }));
    }

    if (!Array.isArray(aiResults)) {
        console.error('KeywordAnalysisService: Gemini response is not a JSON array. Raw text:', responseText);
        return keywordsArray.map(kw => ({ ...kw, aiRelevance: { error: 'AI response not an array' } }));
    }
    
    const aiResultsMap = new Map();
    aiResults.forEach(res => {
      if (res && typeof res.keyword === 'string' && typeof res.relevance_score === 'number' && typeof res.justification === 'string') {
        aiResultsMap.set(res.keyword, {
          score: res.relevance_score,
          justification: res.justification,
        });
      } else {
        console.warn('KeywordAnalysisService: Malformed item in AI results array:', res);
      }
    });

    const augmentedKeywords = keywordsArray.map(originalKeywordObj => {
      const aiData = aiResultsMap.get(originalKeywordObj.keyword);
      return {
        ...originalKeywordObj,
        aiRelevance: aiData ? { score: aiData.score, justification: aiData.justification } : { error: 'Keyword not found in AI results or AI result malformed' },
      };
    });
    
    console.info(`KeywordAnalysisService: Successfully processed AI relevance for ${augmentedKeywords.filter(kw => kw.aiRelevance && !kw.aiRelevance.error).length} out of ${keywordsArray.length} keywords.`);
    return augmentedKeywords;

  } catch (error) {
    console.error('KeywordAnalysisService: Error calling Gemini API for keyword relevance:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return keywordsArray.map(kw => ({ ...kw, aiRelevance: { error: `AI API call failed: ${errorMessage}` } }));
  }
}

module.exports = {
  getRelevanceForKeywords,
};
