// S.A.F.E. D.R.Y. A.R.C.H.I.T.E.C.T. - Resilient Keyword Analysis Service
// 'Durable' and 'Fortified' with batch processing for efficiency and error handling.

import {
  geminiClient,
  HarmCategory,
  HarmBlockThreshold,
  GenerateContentRequest,
} from './geminiClientWrapper';

// --- Interfaces ---
export interface KeywordInput {
  keyword: string;
  source_video_count: number;
  engagement_score: number;
  weighted_recency_score: number;
}

export interface AIRelevance {
  score: number; // 0-10
  justification: string;
  error?: string;
}

interface AIRelevanceResponseItem {
  keyword: string;
  score: number;
  justification: string;
}

/**
 * 'Automated' batch processing of keywords for relevance analysis.
 * This function sends a single request to the AI to analyze multiple keywords,
 * making it 'Resilient' to API rate limits and improving performance.
 * @param topic The central topic for relevance analysis.
 * @param keywords An array of keyword data to be analyzed.
 * @returns A promise that resolves to an array of AIRelevance objects.
 */
export async function getRelevanceForKeywords(
  topic: string,
  keywords: KeywordInput[],
): Promise<AIRelevance[]> {
  if (!geminiClient) {
    return keywords.map(() => ({
      score: 0,
      justification: '',
      error: 'Gemini client not initialized.',
    }));
  }

  if (keywords.length === 0) {
    return [];
  }

  const keywordListForPrompt = keywords.map(k => ({
    keyword: k.keyword,
    source_video_count: k.source_video_count,
    engagement_score: k.engagement_score,
  }));

  const prompt = `
    Analyze the relevance of the following keywords for a video topic: "${topic}".
    For each keyword, consider its provided metrics (source_video_count, engagement_score).
    Provide a relevance score from 0 (irrelevant) to 10 (highly relevant) and a brief justification for each.

    Keywords data:
    ${JSON.stringify(keywordListForPrompt, null, 2)}

    Your response MUST be a single, valid JSON array of objects. Each object in the array must contain "keyword", "score", and "justification" keys.
    The "keyword" must exactly match one of the keywords provided.

    Example response format:
    [
      {
        "keyword": "example keyword 1",
        "score": 8,
        "justification": "This keyword is highly relevant because..."
      },
      {
        "keyword": "example keyword 2",
        "score": 4,
        "justification": "This keyword has moderate relevance..."
      }
    ]
  `;

  const request: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      topK: 1,
      topP: 1,
      maxOutputTokens: 4096,
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
  };

  try {
    const result = await geminiClient.generateContent(request);
    const text = result.response.text();
    if (!text) {
      throw new Error('Empty response from AI.');
    }

    const parsedResponse: AIRelevanceResponseItem[] = JSON.parse(text.replace(/```json|```/g, '').trim());

    const relevanceMap = new Map<string, AIRelevance>();
    parsedResponse.forEach(item => {
      relevanceMap.set(item.keyword, { score: item.score, justification: item.justification });
    });

    return keywords.map(inputKeyword => {
      const relevance = relevanceMap.get(inputKeyword.keyword);
      if (relevance) {
        return relevance;
      }
      // Return a default value if a keyword was not in the AI response
      return {
        score: 0,
        justification: 'Keyword not found in AI response.',
      };
    });

  } catch (error: any) {
    console.error(`[KeywordAnalysisService] AI API call failed for batch keyword analysis:`, error);
    const isQuotaError = error.message?.includes('429');
    const errorMessage = isQuotaError
      ? 'Daily AI analysis quota reached. Please try again tomorrow.'
      : `AI API call failed: ${error.message}`;

    // On failure, return an error object for all keywords
    return keywords.map(() => ({
      score: 0,
      justification: '',
      error: errorMessage,
    }));
  }
}

